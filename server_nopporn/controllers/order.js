const prisma = require("../config/prisma");

exports.beginCheckout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ดึงตะกร้า
    const cart = await prisma.cart.findFirst({
      where: { customerId: userId },
      include: { products: { include: { product: true } } }, // ProductOnCart[]
    });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // รวมยอด "บาท"
    const total = cart.products.reduce(
      (sum, it) => sum + Number(it.product.price) * Number(it.count),
      0
    );

    // ✅ ใช้ orderItems (ไม่ใช่ items)
    // หมายเหตุ: ฟิลด์ใน OrderItem ของคุณน่าจะเป็น `quantity` และ `price` (Float)
    // ถ้าในสคีมาคุณเป็น `qty` / `unitPrice` ให้สลับบรรทัดที่คอมเมนต์ให้ตรง
    const order = await prisma.order.create({
      data: {
        customerId: userId,
        status: "PENDING",
        total, // Float (บาท)
        orderItems: {
          create: cart.products.map((it) => ({
            productId: it.productId,
            quantity: it.count,            // ← ถ้าสคีมาคุณใช้ `qty`, เปลี่ยนเป็น `qty: it.count`
            price: Number(it.product.price) // ← ถ้าใช้ `unitPrice`, เปลี่ยนเป็น `unitPrice: Number(...)`
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    // ล้างตะกร้า
    await prisma.productOnCart.deleteMany({ where: { cartId: cart.id } });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id, customerId: userId }, // ปรับ field ให้ตรง
      include: { items: { include: { product: true } }, payment: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) { next(e); }
};
