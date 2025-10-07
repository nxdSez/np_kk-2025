const router = require('express').Router();
const {authCheck, staffOnly} = require('../middleware/authCheck');
const ctrl = require('../controllers/adminPayment');

router.use(authCheck, staffOnly);

// คิวตรวจสลิป (กรองตาม Payment.status)
// อนุมัติ/ปฏิเสธ อิงจาก orderId (อ่าน payment ผ่าน order.paymentId)
router.get('/payments', ctrl.listPaymentQueue);
router.post('/payments/:orderId/approve', ctrl.approvePayment);
router.post('/payments/:orderId/reject', ctrl.rejectPayment);

// ✅ ใหม่: รายละเอียด payment + slipUrl
router.get('/payments/:orderId', ctrl.getPaymentDetail);

// ✅ ใหม่: proxy รูปสลิป (กรณี slipUrl private)
router.get('/payments/:orderId/slip-proxy', ctrl.streamSlip);

module.exports = router;
