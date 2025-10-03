const prisma = require('../config/prisma');

// 1) แนะนำจากสินค้าตัวเดียว
exports.getRelatedProducts = async (req, res) => {
  try {
    const idParam   = req.params.productId ?? req.params.id;
    const productId = Number(idParam);
    const limit     = Number(req.query.limit || 6);

    const rows = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: productId },
      orderBy: { weight: 'desc' },
      take: limit,
      include: { target: { include: { images: true } } }, // ⬅️ include images
    });

    res.json(rows.map(r => r.target).filter(Boolean));
  } catch (err) {
    console.error('getRelatedProducts error:', err);
    res.status(500).json({ message: 'getRelatedProducts failed' });
  }
};

// 2) แนะนำจากหลายสินค้า (เช่นในกริด Shop/Home)
exports.getRelatedForMany = async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',').map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);

    const limit = Number(req.query.limit || 8);
    if (ids.length === 0) return res.json([]);

    const assocs = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: { in: ids } },
      include: { target: { include: { images: true } } }, // ⬅️ include images
    });

    const scoreMap = new Map(); // id -> { product, score }
    for (const a of assocs) {
      const p = a.target;
      if (!p) continue;
      const cur = scoreMap.get(p.id);
      const score = (cur?.score || 0) + (a.weight || 0);
      scoreMap.set(p.id, { product: p, score });
    }

    const sorted = [...scoreMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.product);

    res.json(sorted);
  } catch (err) {
    console.error('getRelatedForMany error:', err);
    res.status(500).json({ message: 'getRelatedForMany failed' });
  }
};

// 3) Personalized: แสดงสินค้าที่ซื้อล่าสุดก่อน แล้วตามด้วยสินค้าเชื่อม
exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "unauthorized" });

    const limit    = Number(req.query.limit || 12);
    const lookback = Number(req.query.lookback || 3);
    const inStock  = String(req.query.inStock || '1') === '1';

    const orders = await prisma.order.findMany({
      where: { customerId: Number(userId), status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: lookback,
      select: { orderItems: { select: { productId: true } } },
    });
    if (!orders.length) return res.json([]);

    const seenIds = new Set();
    const purchasedIdsOrdered = [];
    for (const o of orders) {
      for (const oi of o.orderItems) {
        const pid = Number(oi.productId);
        if (!seenIds.has(pid)) { seenIds.add(pid); purchasedIdsOrdered.push(pid); }
      }
    }

    // สินค้าที่ซื้อล่าสุด (พร้อมรูป)
    const purchasedProductsAll = await prisma.product.findMany({
      where: { id: { in: purchasedIdsOrdered } },
      include: { images: true }, // ⬅️ include images
    });
    const purchasedMap = new Map(purchasedProductsAll.map(p => [p.id, p]));
    const purchasedProducts = purchasedIdsOrdered
      .map(id => purchasedMap.get(id))
      .filter(Boolean)
      .filter(p => !inStock || typeof p.quantity !== 'number' || p.quantity > 0);

    // สินค้าที่เชื่อม (พร้อมรูป)
    const assocs = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: { in: [...seenIds] } },
      include: { target: { include: { images: true } } }, // ⬅️ include images
    });

    const combinedSet = new Set();
    const result = [];

    // ดันสินค้าที่เพิ่งซื้อขึ้นก่อน
    for (const p of purchasedProducts) {
      if (p && !combinedSet.has(p.id)) {
        combinedSet.add(p.id);
        result.push(p);
        if (result.length >= limit) return res.json(result.slice(0, limit));
      }
    }

    // ตามด้วยสินค้าที่เชื่อม (เรียงตาม weight)
    const scoreMap = new Map();
    for (const a of assocs) {
      const t = a.target;
      if (!t) continue;
      if (inStock && typeof t.quantity === 'number' && t.quantity <= 0) continue;
      const cur = scoreMap.get(t.id);
      const sc = (cur?.score || 0) + (a.weight || 0);
      scoreMap.set(t.id, { product: t, score: sc });
    }
    const assocRanked = [...scoreMap.values()]
      .sort((a, b) => b.score - a.score)
      .map(x => x.product);

    for (const p of assocRanked) {
      if (!combinedSet.has(p.id)) {
        combinedSet.add(p.id);
        result.push(p);
        if (result.length >= limit) break;
      }
    }

    res.json(result.slice(0, limit));
  } catch (err) {
    console.error('getMyRecommendations error:', err);
    res.status(500).json({ message: 'getMyRecommendations failed' });
  }
};
