// server_nopporn/controllers/promptpay.js
require("dotenv").config();
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const { createPromptPayQR } = require("../utils/promptpay");

// ====== CONFIG ======
const EXPIRES = process.env.CHECKOUT_EXPIRES || "10m"; // ใช้จริง
const SIGN_KEY =
  process.env.CHECKOUT_SIGNING_KEY ||
  process.env.CHECKOUT_SECRET ||
  process.env.SECRET; // ต้องมีอย่างน้อยหนึ่ง

// คีย์สำหรับ verify JWT ล็อกอิน (ลองหลายๆ ตัวที่โปรเจ็กต์คุณอาจใช้)
const JWT_SECRETS = [
  process.env.JWT_SECRET,
  process.env.ACCESS_TOKEN_SECRET,
  process.env.AUTH_JWT_SECRET,
  process.env.SECRET, // โปรเจ็กต์คุณมี SECRET
].filter(Boolean);

// ====== HELPERS ======
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function tryVerifyLoginToken(token) {
  if (!token) return null;
  for (const s of JWT_SECRETS) {
    try {
      const p = jwt.verify(token, s);
      const id = toInt(p?.id || p?.userId || p?.uid);
      if (id !== null) return id;
    } catch (_) {}
  }
  return null;
}

function getUserId(req) {
  // 1) จาก middleware
  if (req.user?.id) {
    const id = toInt(req.user.id);
    if (id !== null) return id;
  }

  // 2) Authorization: Bearer xxx
  const auth = req.headers?.authorization || req.headers?.Authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const idFromBearer = tryVerifyLoginToken(bearer);
  if (idFromBearer !== null) return idFromBearer;

  // 3) Cookie token
  const cookieToken = req.cookies?.token || req.cookies?.accessToken;
  const idFromCookie = tryVerifyLoginToken(cookieToken);
  if (idFromCookie !== null) return idFromCookie;

  // 4) Dev override
  if (process.env.NODE_ENV !== "production") {
    const dev =
      req.headers["x-user-id"] || req.body?.customerId || req.query?.customerId;
    const devId = toInt(dev);
    if (devId !== null) return devId;
  }

  return null;
}

function signCheckout(payload) {
  if (!SIGN_KEY) throw new Error("CHECKOUT_SIGNING_KEY is missing");
  return jwt.sign(payload, SIGN_KEY, { expiresIn: EXPIRES }); // ✅ ใช้ EXPIRES จริง
}
function verifyCheckout(token) {
  if (!SIGN_KEY) throw new Error("CHECKOUT_SIGNING_KEY is missing");
  return jwt.verify(token, SIGN_KEY);
}

// ====== CONTROLLERS ======

// POST /api/promptpay/intent-from-cart
exports.intentFromCart = async (req, res) => {
  try {
    const userId = getUserId(req); // number หรือ null
    if (userId === null) return res.status(401).json({ ok: false, message: "unauthorized" });

    const cart = await prisma.cart.findFirst({
      where: { customerId: userId }, // Int
      include: { products: { include: { product: true } } },
    });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is empty" });
    }

    const items = cart.products.map((it) => ({
      productId: toInt(it.productId),
      title: it.product.title,
      unitPrice: Number(it.product.price),
      qty: Number(it.count),
    }));

    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

    const target =
      req.body?.target ||
      process.env.PROMPTPAY_PHONE ||
      process.env.PROMPTPAY_TARGET ||
      process.env.PROMPTPAY_ID;

    const { payload } = createPromptPayQR({
      target,
      amountTHB: total,
      message: "Nopporn Trading",
    });

    const checkoutToken = signCheckout({ uid: userId, items, total, v: 1 });
    return res.json({ ok: true, payload, checkoutToken, items, total, target });
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ ok: false, error: e.message || "Internal Error" });
  }
};

// POST /api/promptpay/confirm
exports.confirm = async (req, res) => {
  try {
    const { checkoutToken, slipUrl, transactionRef } = req.body;
    if (!checkoutToken || !slipUrl) {
      return res.status(400).json({ ok: false, message: "missing fields" });
    }

    let data;
    try {
      data = verifyCheckout(checkoutToken); // ถ้า EXPIRES หมดจะโยน error
    } catch {
      return res.status(400).json({ ok: false, message: "checkout token invalid/expired" });
    }

    const uid = toInt(data.uid);
    if (uid === null) {
      return res.status(400).json({ ok: false, message: "invalid uid in token" });
    }

    const productIds = data.items.map((i) => toInt(i.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const priceMap = Object.fromEntries(products.map((p) => [p.id, Number(p.price)]));

    const recomputedTotal = data.items.reduce(
      (s, it) => s + (priceMap[toInt(it.productId)] ?? Number(it.unitPrice)) * Number(it.qty),
      0
    );

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: uid,
          status: "PENDING",
          total: recomputedTotal,
          orderItems: {
            create: data.items.map((it) => ({
              productId: toInt(it.productId),
              quantity: Number(it.qty),
              price: priceMap[toInt(it.productId)] ?? Number(it.unitPrice),
            })),
          },
        },
        include: { orderItems: true },
      });

      const payment = await tx.payment.create({
        data: {
          method: "PROMPTPAY_MANUAL",
          status: "PENDING_REVIEW",
          amount: Math.round(recomputedTotal * 100), // สตางค์
          slipUrl,
          transactionRef: transactionRef || null,
          order: { connect: { id: order.id } },
        },
      });

      const cart = await tx.cart.findFirst({ where: { customerId: uid } });
      if (cart) await tx.productOnCart.deleteMany({ where: { cartId: cart.id } });

      return { orderId: order.id, paymentId: payment.id };
    });

    return res.json({ ok: true, ...created });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Internal Error" });
  }
};
