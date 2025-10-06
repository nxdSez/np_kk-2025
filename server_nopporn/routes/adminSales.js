const express = require("express");
const router = express.Router();
const { authCheck, staffOnly } = require("../middleware/authCheck");
const {
  getSummary,
  getDaily,
  getMonthly,
} = require("../controllers/adminSales.controller");

// ✅ เส้นทาง API Dashboard
router.get("/admin/sales/summary", authCheck, staffOnly, getSummary);
router.get("/admin/sales/daily", authCheck, staffOnly, getDaily);
router.get("/admin/sales/monthly", authCheck, staffOnly, getMonthly);

module.exports = router;
