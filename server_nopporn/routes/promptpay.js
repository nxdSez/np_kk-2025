const router = require("express").Router();
const { authCheck } = require("../middleware/authCheck");
const ctrl = require("../controllers/promptpay");

// ขอ QR จากตะกร้า (ยังไม่สร้าง order)
router.post("/intent-from-cart", authCheck, ctrl.intentFromCart);

// แนบสลิป + ค่อยสร้าง Order/Payment
router.post("/confirm", authCheck, ctrl.confirm);

module.exports = router;
