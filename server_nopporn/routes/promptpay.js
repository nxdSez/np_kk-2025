const router = require("express").Router();
const { authCheck } = require("../middleware/authCheck");
const ctrl = require("../controllers/promptpay");

// สร้าง QR PromptPay ตามยอดของออเดอร์
router.post("/intent", authCheck, ctrl.createIntent);

// แนบสลิปหลังโอน
router.post("/attach-slip", authCheck, ctrl.attachSlip);

module.exports = router;
