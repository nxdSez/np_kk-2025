const prisma = require('../config/prisma');

// แสดงรายการทั้งหมด
exports.listAssoc = async (req, res) => {
  const rows = await prisma.productAssociation.findMany({
    include: {
      source: { select: { id: true, title: true } },
      target: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(rows);
};

// สร้าง (ถ้ามีคู่นี้อยู่แล้วจะอัปเดตแทน)
exports.createAssoc = async (req, res) => {
  let { name, sourceProductId, targetProductId, weight = 1, isActive = true } = req.body;
  sourceProductId = Number(sourceProductId);
  targetProductId = Number(targetProductId);
  weight = Number(weight);

  if (!name || !sourceProductId || !targetProductId) {
    return res.status(400).json({ message: 'name, sourceProductId, targetProductId required' });
  }
  if (sourceProductId === targetProductId) {
    return res.status(400).json({ message: 'source and target must be different' });
  }

  // upsert ตาม unique([sourceProductId, targetProductId])
  const assoc = await prisma.productAssociation.upsert({
    where: { sourceProductId_targetProductId: { sourceProductId, targetProductId } },
    update: { name, weight, isActive },
    create: { name, sourceProductId, targetProductId, weight, isActive },
  });

  const row = await prisma.productAssociation.findUnique({
    where: { id: assoc.id },
    include: {
      source: { select: { id: true, title: true } },
      target: { select: { id: true, title: true } },
    },
  });
  res.status(201).json(row);
};

// แก้ไข
exports.updateAssoc = async (req, res) => {
  const id = Number(req.params.id);
  const { name, sourceProductId, targetProductId, weight, isActive } = req.body;
  const data = {};
  if (name != null) data.name = String(name);
  if (sourceProductId != null) data.sourceProductId = Number(sourceProductId);
  if (targetProductId != null) data.targetProductId = Number(targetProductId);
  if (weight != null) data.weight = Number(weight);
  if (isActive != null) data.isActive = Boolean(isActive);

  const row = await prisma.productAssociation.update({
    where: { id },
    data,
    include: {
      source: { select: { id: true, title: true } },
      target: { select: { id: true, title: true } },
    },
  });
  res.json(row);
};

// ลบ
exports.deleteAssoc = async (req, res) => {
  await prisma.productAssociation.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
};
