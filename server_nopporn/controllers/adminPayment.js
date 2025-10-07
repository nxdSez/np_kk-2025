const prisma = require('../config/prisma');
const _fetch = (...args) =>
  (global.fetch ? global.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)));


async function listPaymentQueue(req, res) {
  try {
    const { status = 'PENDING_REVIEW', q = '', page = '1', pageSize = '10' } = req.query;
    const take = parseInt(pageSize, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const where = {
      method: 'PROMPTPAY_MANUAL',
      status: status.toUpperCase(),
      ...(q
        ? {
          OR: [
            { order: { id: isNaN(Number(q)) ? undefined : Number(q) } },
            { order: { customer: { name: { contains: q, mode: 'insensitive' } } } },
            { order: { customer: { email: { contains: q, mode: 'insensitive' } } } },
          ].filter(Boolean),
        }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              customer: { select: { id: true, name: true, email: true } },
              orderItems: { select: { quantity: true, price: true, product: { select: { title: true, price: true } } } },
            },
          },
          verifiedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ items, page: Number(page), pageSize: take, total, totalPages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load payment queue' });
  }
}

function calcOrderTotal(order) {
  if (!order?.orderItems?.length) return 0;
  return order.orderItems.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
}

async function approvePayment(req, res) {
  try {
    const orderId = Number(req.params.orderId);
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true, orderItems: true } });
    if (!order || !order.paymentId) return res.status(404).json({ message: 'Order or Payment not found' });

    const payment = await prisma.payment.update({
      where: { id: order.paymentId },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
        verifiedById: req.user.id,
        reviewNote: null,
        amount: Math.round(order.total ?? calcOrderTotal(order)),
        currency: 'THB',
      },
    });

    await prisma.order.update({ where: { id: orderId }, data: { status: 'APPROVED' } });

    res.json({ message: 'Approved', paymentId: payment.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Approve failed' });
  }
}

async function rejectPayment(req, res) {
  try {
    const orderId = Number(req.params.orderId);
    const { reviewNote = 'สลิปไม่ถูกต้อง/ยอดไม่ตรง' } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
    if (!order || !order.paymentId) return res.status(404).json({ message: 'Order or Payment not found' });

    await prisma.payment.update({
      where: { id: order.paymentId },
      data: { status: 'REJECTED', verifiedById: req.user.id, reviewNote },
    });

    // นโยบาย: ให้ลูกค้าอัปโหลดใหม่
    await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING' } });

    res.json({ message: 'Rejected' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Reject failed' });
  }
}

async function getPaymentDetail(req, res) {
  try {
    const orderId = Number(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }, // ← ไม่ select รายฟิลด์ เพื่อกัน schema mismatch
    });

    if (!order || !order.payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const p = order.payment;
    // ส่งคืนแบบปลอดภัย เฉพาะฟิลด์ที่มีจริงใน schema ปัจจุบันของคุณ
    res.json({
      orderId,
      payment: {
        id: p.id,
        method: p.method,
        status: p.status,
        slipUrl: p.slipUrl ?? null,
        paidAt: p.paidAt ?? null,
        createdAt: p.createdAt ?? null,
        amount: p.amount ?? null,
        currency: p.currency ?? null,
        transactionRef: p.transactionRef ?? null,
        promptpayPayload: p.promptpayPayload ?? null,
        updatedAt: p.updatedAt ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to load payment detail' });
  }
}

async function streamSlip(req, res) {
  try {
    const orderId = Number(req.params.orderId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    const url = order?.payment?.slipUrl;
    if (!url) return res.status(404).json({ message: 'Slip not found' });

    const r = await _fetch(url);
    if (!r.ok) {
      return res.status(502).json({ message: 'Upstream fetch failed' });
    }

    const ct = r.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'no-store');

    // stream → client
    if (r.body && typeof r.body.pipe === 'function') {
      r.body.pipe(res);
    } else {
      const buf = Buffer.from(await r.arrayBuffer());
      res.end(buf);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Slip proxy error' });
  }
}

module.exports = { listPaymentQueue, approvePayment, rejectPayment, streamSlip, getPaymentDetail };