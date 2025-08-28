// import ....
const express = require("express");
const { authCheck } = require("../middleware/authCheck");
const router = express.Router();
// import controller
const { payment } = require("../controllers/constripe");

router.post("/user/create-payment-intent", authCheck, payment);

module.exports = router;