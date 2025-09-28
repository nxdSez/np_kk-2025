const prisma = require('../config/prisma');

// /products/:id/related?limit=6
exports.getRelatedProducts = async (req, res) => {
  const productId = Number(req.params.id);
  const limit = Number(req.query.limit || 6);

  const rows = await prisma.productAssociation.findMany({
    where: { isActive: true, sourceProductId: productId },
    orderBy: { weight: 'desc' },
    take: limit,
    include: {
      target: { include: { images: true } }, // ปรับตาม schema ภาพของคุณ
    },
  });

  res.json(rows.map((r) => r.target));
};
