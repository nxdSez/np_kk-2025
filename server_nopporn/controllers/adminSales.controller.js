// server/controllers/adminSales.controller.js
const prisma = require("../config/prisma");

// === ค่าคงที่ตามสคีมาจริง ===
const SUCCESS_STATUSES = ["APPROVED"]; // OrderStatus enum

// === Helpers ===
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const parseDate  = (v, fb) => { if (!v) return fb; const d = new Date(v); return isNaN(d) ? fb : d; };
const toNum      = (x, fb=0) => Number.isFinite(Number(x)) ? Number(x) : fb;

/** GET /api/admin/sales/summary
 *  { totalSales, orderCount, from, to }
 */
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const fromDate = startOfDay(parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1)));
    const toDate   = endOfDay(parseDate(req.query.to, now));

    const result = await prisma.order.aggregate({
      _sum:   { total: true },
      _count: { id: true },
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
    });

    res.json({
      totalSales: toNum(result._sum?.total, 0),
      orderCount: toNum(result._count?.id, 0),
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/admin/sales/daily
 *  [{ day: 'YYYY-MM-DD', totalSales }]
 */
exports.getDaily = async (req, res) => {
  try {
    const now = new Date();
    const fromDate = startOfDay(parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1)));
    const toDate   = endOfDay(parseDate(req.query.to, now));

    const orders = await prisma.order.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const daily = {};
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      daily[key] = (daily[key] || 0) + toNum(o.total);
    }
    const data = Object.entries(daily).map(([day, totalSales]) => ({ day, totalSales }));
    res.json(data);
  } catch (err) {
    console.error("getDaily error:", err);
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/admin/sales/monthly?year=YYYY
 *  [{ month: 'YYYY-MM', totalSales }]
 */
exports.getMonthly = async (req, res) => {
  try {
    const y = Number(req.query.year) || new Date().getFullYear();
    const fromDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
    const toDate   = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));

    const orders = await prisma.order.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthly = {};
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthly[key] = (monthly[key] || 0) + toNum(o.total);
    }
    const data = Object.entries(monthly).map(([month, totalSales]) => ({ month, totalSales }));
    res.json(data);
  } catch (err) {
    console.error("getMonthly error:", err);
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/admin/sales/by-product?from=YYYY-MM-DD&to=YYYY-MM-DD
 *  [{ productId, productName, sold, revenue }]
 *  - productName มาจาก Product.title (ตามสคีมาจริง)
 *  - revenue = sum(quantity * price) จาก OrderItem
 */
exports.getSalesByProduct = async (req, res) => {
  try {
    const now = new Date();
    const fromDate = startOfDay(parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), 1)));
    const toDate   = endOfDay(parseDate(req.query.to, now));

    // ดึงบรรทัดสินค้าในออเดอร์ที่สำเร็จ ภายในช่วงวัน
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: SUCCESS_STATUSES },
          createdAt: { gte: fromDate, lte: toDate },
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true, // unit price
        product: { select: { id: true, title: true } }, // <-- ใช้ 'title' เป็นชื่อสินค้า
      },
    });

    // รวมยอดตามสินค้า
    const acc = new Map();
    for (const it of items) {
      const pid = it.productId ?? it.product?.id;
      const name = it.product?.title || `#${pid}`;
      const sold = toNum(it.quantity, 0);
      const revenue = toNum(it.quantity, 0) * toNum(it.price, 0);

      if (!acc.has(pid)) acc.set(pid, { productId: pid, productName: name, sold: 0, revenue: 0 });
      const row = acc.get(pid);
      row.sold += sold;
      row.revenue += revenue;
    }

    const result = Array.from(acc.values()).sort((a, b) => b.sold - a.sold);
    res.json(result);
  } catch (err) {
    console.error("getSalesByProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};
