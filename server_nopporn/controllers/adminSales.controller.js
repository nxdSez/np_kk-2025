const prisma = require("../config/prisma");

// Guard model name (unlikely needed, but safe if client exposes plural)
const OrderModel = prisma.order ?? prisma.orders;

/* Helpers */
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function parseDate(v, fb) { if (!v) return fb; const d = new Date(v); return isNaN(d.getTime()) ? fb : d; }

// Use enum values from schema: PENDING | APPROVED | CANCELLED
const SUCCESS_STATUSES = ["APPROVED"];

// GET /api/admin/sales/summary
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const fromDate = startOfDay(parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)));
    const toDate   = endOfDay(parseDate(req.query.to, now));

    if (!OrderModel) throw new Error("Order model not found on Prisma client");

    const result = await OrderModel.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
    });

    res.json({
      totalSales: Number(result._sum?.total ?? 0),
      totalOrders: Number(result._count?.id ?? 0),
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
  } catch (err) {
    console.error("❌ getSummary Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/sales/daily
exports.getDaily = async (req, res) => {
  try {
    const now = new Date();
    const fromDate = startOfDay(parseDate(req.query.from, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)));
    const toDate   = endOfDay(parseDate(req.query.to, now));

    if (!OrderModel) throw new Error("Order model not found on Prisma client");

    const orders = await OrderModel.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const daily = {};
    for (const o of orders) {
      if (!o.createdAt) continue;
      const key = o.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      daily[key] = (daily[key] || 0) + Number(o.total || 0);
    }

    const data = Object.entries(daily).map(([date, totalSales]) => ({ date, totalSales }));
    res.json(data);
  } catch (err) {
    console.error("❌ getDaily Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/sales/monthly
exports.getMonthly = async (req, res) => {
  try {
    const y = Number(req.query.year) || new Date().getFullYear();
    const fromDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
    const toDate   = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));

    if (!OrderModel) throw new Error("Order model not found on Prisma client");

    const orders = await OrderModel.findMany({
      where: {
        status: { in: SUCCESS_STATUSES },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthly = {};
    for (const o of orders) {
      if (!o.createdAt) continue;
      const key = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthly[key] = (monthly[key] || 0) + Number(o.total || 0);
    }

    const data = Object.entries(monthly).map(([month, totalSales]) => ({ month, totalSales }));
    res.json(data);
  } catch (err) {
    console.error("❌ getMonthly Error:", err);
    res.status(500).json({ message: err.message });
  }
};
