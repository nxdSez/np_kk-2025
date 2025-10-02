const prisma = require('../config/prisma');

function readQuery(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== '') {
      return String(obj[k]).trim();
    }
  }
  return '';
}
const isIntString = (s) => /^\d+$/.test(s || '');


exports.searchProductsForPos = async (req, res) => {
  try {
    const q = readQuery(req.query, 'q', 'productname', 'productid', 'name', 'id');
    if (!q) return res.status(400).json({ message: "missing query: use ?q=..., or productname/productid" });

    const OR = [];
    if (isIntString(q)) OR.push({ id: Number(q) });
    OR.push({ title: { contains: q } });

    const products = await prisma.product.findMany({
      where: { OR },
      take: 20,
      orderBy: { id: 'asc' },
      select: { id: true, title: true, price: true, quantity: true },
    });

    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Search products failed' });
  }
};

exports.searchUsersForPos = async (req, res) => {
  try {
    const q = readQuery(req.query, 'q', 'email', 'id', 'code', 'phone');
    if (!q) return res.status(400).json({ message: "missing query: use ?q=..., or email/id" });

    const OR = [];
    if (isIntString(q)) OR.push({ id: Number(q) });
    OR.push({ email: { contains: q } });

    const users = await prisma.user.findMany({
      where: { OR },
      take: 20,
      orderBy: { id: 'asc' },
      select: { id: true, email: true, address: true },
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Search users failed' });
  }
};

async function logOrderAnalytics(tx, order) {
  const customerID = order.customer?.code ?? String(order.customerId);
  const orderID    = String(order.id);
  const orderDate  = order.updatedAt ?? new Date();

  const itemsToCount = (order.orderItems || []).filter((it) => !it.counted);

  for (const it of itemsToCount) {
    const productID = it.product?.code ?? String(it.productId);

    const prev = await tx.orderLineLog.count({
      where: { customerID, productID },
    });

    await tx.orderLineLog.create({
      data: {
        customerID,
        productID,
        orderID,
        orderDate,
        price: Number(it.price),
        frequency: prev + 1,
      },
    });

    await tx.orderItem.update({
      where: { id: it.id },
      data: { counted: true },
    });
  }
}


exports.createManualOrder = async (req, res) => {
  try {
    const { customerId, items = [], status } = req.body;

    if (!customerId) return res.status(400).json({ message: 'customerId is required' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must not be empty' });
    }

    const productIds = [...new Set(items.map((i) => Number(i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, quantity: true, title: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lines = items.map((i) => {
      const pid = Number(i.productId);
      const qty = Math.max(1, Number(i.quantity || 1));
      const base = productMap.get(pid);
      if (!base) throw new Error(`product ${pid} not found`);

      const price = i.price != null ? Number(i.price) : Number(base.price);
      return { productId: pid, quantity: qty, price };
    });

    for (const ln of lines) {
      const base = productMap.get(ln.productId);
      if (base.quantity < ln.quantity) {
        return res.status(400).json({ message: `สต๊อกสินค้า "${base.title}" ไม่พอ` });
      }
    }

    const total = lines.reduce(
      (s, l) => s + Number(l.price) * Number(l.quantity),
      0
    );
    const enumStatus = String(status || 'APPROVED').toUpperCase();

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customer: { connect: { id: Number(customerId) } },
          status: enumStatus,
          total,
          orderItems: {
            create: lines.map((l) => ({
              product: { connect: { id: l.productId } },
              quantity: l.quantity,
              price: l.price,
              counted: false,
            })),
          },
        },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });

      // อัปเดตสต๊อก
      for (const l of lines) {
        await tx.product.update({
          where: { id: l.productId },
          data: {
            quantity: { decrement: l.quantity },
            sold: { increment: l.quantity },
          },
        });
      }

      // ถ้าอนุมัติ → เขียน Log
      if (enumStatus === 'APPROVED') {
        await logOrderAnalytics(tx, order);
      }

      return order;
    });

    res.status(201).json({ ok: true, order: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create manual order failed', error: err.message });
  }
};