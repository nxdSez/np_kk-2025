const express = require("express");
const router = express.Router();
const { authCheck } = require("../middleware/authCheck");
const ctrl = require("../controllers/order"); // ใช้ชื่อไฟล์ controller เดิมของคุณ

// สร้างออเดอร์จากตะกร้า (ลูกค้ากด “ชำระเงิน”)
router.post("/orders/begin-checkout", authCheck, ctrl.beginCheckout);

// ดึงออเดอร์ตาม id (ใช้ตอนเปิดด้วย ?orderId=xxx)
router.get("/orders/:id", authCheck, ctrl.getById);

module.exports = router;
