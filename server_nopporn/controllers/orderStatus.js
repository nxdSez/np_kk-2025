// server_nopporn/controllers/orderStatus.js
const prisma = require('../config/prisma');

// แปลงค่าจาก UI (ไทย/อังกฤษ) -> "สตริง enum" ที่ Prisma รองรับ
const toEnumString = (input) => {
  const s = String(input || '').trim().toUpperCase();
  if (s === 'APPROVED' || s === 'ตรวจสอบแล้ว') return 'APPROVED';
  if (s === 'CANCELLED' || s === 'ยกเลิก') return 'CANCELLED';
  return 'PENDING'; // default
};

// เขียนแถว log สำหรับ analytics + mark counted กันนับซ้ำ (ทำใน transaction)
async function logOrderAnalytics(tx, order) {
  const customerID = order.customer?.code ?? String(order.customerId);
  const orderID    = String(order.id);
  const orderDate  = order.updatedAt ?? new Date();

  // นับเฉพาะรายการที่ยังไม่เคยนับ
  const itemsToCount = order.orderItems.filter((it) => !it.counted);

  for (const it of itemsToCount) {
    const productID = it.product?.code ?? String(it.productId);

    // นับจำนวนครั้งก่อนหน้า (คีย์ = ลูกค้าคนนี้ซื้อสินค้านี้กี่ครั้งแล้ว)
    const prev = await tx.orderLineLog.count({
      where: { customerID, productID },
    });

    await tx.orderLineLog.create({
      data: {
        customerID,
        productID,
        orderID,
        orderDate,
        // ถ้าต้องการยอดต่อแถวแทนราคาต่อหน่วย เปลี่ยนเป็น: Number(it.price) * Number(it.quantity)
        price: Number(it.price),
        frequency: prev + 1,
      },
    });

    // กันนับซ้ำครั้งต่อไป
    await tx.orderItem.update({
      where: { id: it.id },
      data: { counted: true },
    });
  }
}

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;   // ex: { orderId: 123, status: 'APPROVED' | 'PENDING' | 'ตรวจสอบแล้ว' }
    const enumStatus = toEnumString(status);

    const updated = await prisma.$transaction(async (tx) => {
      // อ่าน order + relations ที่ต้องใช้
      const order = await tx.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });
      if (!order) throw new Error('Order not found');

      // อัปเดตสถานะ (ใช้ "สตริง" ของ enum)
      await tx.order.update({
        where: { id: order.id },
        data: { status: enumStatus },
      });

      // เติม log เฉพาะตอนอนุมัติ
      if (enumStatus === 'APPROVED') {
        await logOrderAnalytics(tx, order);
      }

      // ส่ง order ล่าสุดกลับ
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: { include: { product: true } },
          customer: { select: { id: true, email: true, address: true } },
        },
      });
    });

    return res.json({ ok: true, order: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Change order status failed',
      error: err?.message,
    });
  }
};
