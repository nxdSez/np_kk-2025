const prisma = require('../config/prisma');

exports.getRelatedProducts = async (req, res) => {
  try {
    const idParam   = req.params.productId ?? req.params.id;
    const productId = Number(idParam);
    const limit     = Number(req.query.limit || 6);

    const rows = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: productId },
      orderBy: { weight: 'desc' },
      take: limit,
      include: { target: true }, // ⬅️ ไม่ include images เพื่อกัน schema แตกต่าง
    });

    res.json(rows.map(r => r.target).filter(Boolean));
  } catch (err) {
    console.error('getRelatedProducts error:', err);
    res.status(500).json({ message: 'getRelatedProducts failed' });
  }
};

// แนะนำจากหลายสินค้า (เช่น ids ในตะกร้า)
exports.getRelatedForMany = async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map(n => Number(n))
      .filter(n => Number.isFinite(n) && n > 0);

    const limit = Number(req.query.limit || 8);
    if (ids.length === 0) return res.json([]);

    const assocs = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: { in: ids } },
      include: { target: true }, // ⬅️ ไม่ include images
    });

    const exclude = new Set(ids);
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
exports.getMyLatestOrderRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id; // มาจาก authCheck
    if (!userId) return res.status(401).json({ message: 'unauthorized' });

    const limit = Number(req.query.limit || 8);
    const inStockOnly = String(req.query.inStock || '0') === '1';

    // เอาเฉพาะออเดอร์ที่อนุมัติแล้ว = ซื้อสำเร็จ
    const last = await prisma.order.findFirst({
      where: { customerId: Number(userId), status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true },
    });

    if (!last || last.orderItems.length === 0) {
      return res.json([]); // ไม่มีออเดอร์ที่อนุมัติ
    }

    const sourceIds = [...new Set(last.orderItems.map(i => i.productId))];

    // ดึง Association ทั้งหมดที่โยงมาจากสินค้าพวกนี้
    const assocs = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: { in: sourceIds } },
      include: {
        target: { include: { images: true } }, // ปรับตาม schema รูปของโปรเจ็กต์คุณ
      },
    });

    // รวมคะแนนตาม weight และตัดสินค้าที่ซื้อล่าสุดออก (ไม่แนะนำตัวเอง)
    const exclude = new Set(sourceIds);
    const map = new Map(); // id -> { product, score }
    for (const a of assocs) {
      const p = a.target;
      if (!p) continue;
      if (exclude.has(p.id)) continue;
      if (inStockOnly && typeof p.quantity === 'number' && p.quantity <= 0) continue;

      const cur = map.get(p.id);
      const score = (cur?.score || 0) + a.weight;
      map.set(p.id, { product: p, score });
    }

    const sorted = [...map.values()]
      .sort((a, b) => b.score - a.score) // weight สูงก่อน
      .slice(0, limit)
      .map(x => x.product);

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'get recommendations failed', error: err?.message });
  }
};

// แนะนำจากออเดอร์ล่าสุดของ "ฉัน"
exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "unauthorized" });

    const limit    = Number(req.query.limit || 12);
    const lookback = Number(req.query.lookback || 3);     // ใช้กี่ออเดอร์ล่าสุด
    const inStock  = String(req.query.inStock || '1') === '1';

    // ดึงออเดอร์ที่อนุมัติแล้ว (ซื้อสำเร็จ)
    const orders = await prisma.order.findMany({
      where: { customerId: Number(userId), status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: lookback,
      select: { orderItems: { select: { productId: true } } }
    });

    const sourceIds = [...new Set(
      orders.flatMap(o => o.orderItems.map(oi => oi.productId))
    )];

    if (sourceIds.length === 0) return res.json([]);

    // หา target ที่เชื่อมกับสินค้าที่ซื้อไป (ตาม association rules)
    const assocs = await prisma.productAssociation.findMany({
      where: { isActive: true, sourceProductId: { in: sourceIds } },
      include: { target: true },   // ไม่ include images กัน schema แตกต่าง
    });

    // รวมคะแนนตาม weight
    const score = new Map(); // id -> { product, score }
    for (const a of assocs) {
      const p = a.target;
      if (!p) continue;
      if (inStock && typeof p.quantity === 'number' && p.quantity <= 0) continue;
      const cur = score.get(p.id);
      const s = (cur?.score || 0) + (a.weight || 0);
      score.set(p.id, { product: p, score: s });
    }

    const list = [...score.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.product);

    res.json(list);
  } catch (err) {
    console.error('getMyRecommendations error:', err);
    res.status(500).json({ message: 'getMyRecommendations failed' });
  }
};
