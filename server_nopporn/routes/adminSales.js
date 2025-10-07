// server/routes/adminSales.js
const express = require("express");
const router = express.Router();
const { authCheck, staffOnly } = require("../middleware/authCheck");
const {
  getSummary,
  getDaily,
  getMonthly,
  getSalesByProduct,
} = require("../controllers/adminSales.controller");

// กลุ่ม API Dashboard
router.get("/admin/sales/summary", authCheck, staffOnly, getSummary);
router.get("/admin/sales/daily", authCheck, staffOnly, getDaily);
router.get("/admin/sales/monthly", authCheck, staffOnly, getMonthly);

// ใหม่: ยอดขายรายวันตามสินค้า (สำหรับกราฟแท่งเทียน X=ชื่อสินค้า, Y=sold/revenue)
router.get("/admin/sales/by-product", authCheck, staffOnly, getSalesByProduct);

module.exports = router;
