const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/promptpay");

// จากตะกร้า → ขอ payload เพื่อไปแสดง QR
router.post("/intent-from-cart", ctrl.intentFromCart);

// แนบสลิปยืนยัน → ค่อยสร้างคำสั่งซื้อ/ชำระเงิน
router.post("/confirm", ctrl.confirm);

module.exports = router;
