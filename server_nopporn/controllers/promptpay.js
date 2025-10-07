// controllers/promptpay.controller.js
const prisma = require("../config/prisma");
const { createPromptPayQR } = require("../utils/promptpay");
const jwt = require("jsonwebtoken");

// อายุ token สำหรับ checkout (ปรับได้)
const EXPIRES = "10m";

// เซ็น/ตรวจ token (ไม่ต้องสร้างไฟล์ใหม่)
function signCheckout(payload) {
  return jwt.sign(payload, process.env.CHECKOUT_SIGNING_KEY, { expiresIn: EXPIRES });
}
function verifyCheckout(token) {
  return jwt.verify(token, process.env.CHECKOUT_SIGNING_KEY);
}

/**
 * 1) ขอ QR จาก "ตะกร้า" โดยยังไม่สร้าง Order/Payment
 * POST /api/promptpay/intent-from-cart
 */
exports.intentFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findFirst({
      where: { customerId: userId },
      include: { products: { include: { product: true } } }, // ProductOnCart[]
    });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // snapshot (บาท)
    const items = cart.products.map((it) => ({
      productId: it.productId,
      title: it.product.title,
      unitPrice: Number(it.product.price), // บาท (Float)
      qty: Number(it.count),
    }));
    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

    // สร้าง QR ด้วยยอด "บาท"
    const { payload, dataUrl } = await createPromptPayQR({
      promptpayId: process.env.PROMPTPAY_ID,
      amountTHB: total,
    });

    // ออก token (ไม่ลง DB)
    const checkoutToken = signCheckout({ uid: userId, items, total, v: 1 });

    res.json({ qrDataUrl: dataUrl, payload, checkoutToken, items, total });
  } catch (e) {
    next(e);
  }
};

/**
 * 2) แนบสลิป + "ค่อย" สร้าง Order/OrderItems/Payment ในครั้งเดียว (Transaction)
 * POST /api/promptpay/confirm
 * { checkoutToken, slipUrl, transactionRef? }
 */
exports.confirm = async (req, res, next) => {
  try {
    const { checkoutToken, slipUrl, transactionRef } = req.body;
    if (!checkoutToken || !slipUrl) {
      return res.status(400).json({ message: "missing fields" });
    }

    let data;
    try {
      data = verifyCheckout(checkoutToken);
    } catch {
      return res.status(400).json({ message: "checkout token invalid/expired" });
    }

    // revalidate ราคา (กัน client แก้)
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const priceMap = Object.fromEntries(products.map((p) => [p.id, Number(p.price)]));

    const recomputedTotal = data.items.reduce(
      (s, it) => s + (priceMap[it.productId] ?? it.unitPrice) * it.qty,
      0
    );
    const finalTotal = recomputedTotal; // ใช้ราคาล่าสุด; ถ้าจะล็อกยอดตอนสแกน => ใช้ data.total

    const created = await prisma.$transaction(async (tx) => {
      // สร้าง Order + OrderItems (บาท)
      const order = await tx.order.create({
        data: {
          customerId: data.uid,
          status: "PENDING", // ใช้ค่าที่มีจริงใน enum ของคุณ
          total: finalTotal,
          orderItems: {
            create: data.items.map((it) => ({
              productId: it.productId,
              quantity: it.qty,              // ถ้าสคีมาคุณใช้ชื่อ qty ให้คงตามนี้; ถ้าเป็น qty/price ตรงอยู่แล้วโอเค
              price: priceMap[it.productId] ?? it.unitPrice, // บาท
            })),
          },
        },
        include: { orderItems: true },
      });

      // สร้าง Payment (สตางค์)
      const payment = await tx.payment.create({
        data: {
          method: "PROMPTPAY_MANUAL",
          status: "PENDING_REVIEW",
          amount: Math.round(finalTotal * 100),
          slipUrl,
          transactionRef: transactionRef || null,
          order: { connect: { id: order.id } },
        },
      });

      // ล้างตะกร้า
      const cart = await tx.cart.findFirst({ where: { customerId: data.uid } });
      if (cart) await tx.productOnCart.deleteMany({ where: { cartId: cart.id } });

      return { orderId: order.id, paymentId: payment.id };
    });

    res.json({ ok: true, ...created });
  } catch (e) {
    next(e);
  }
};
