const express = require('express')
const { employeeCheck, authCheck } = require('../middleware/authCheck')
const router = express.Router()

const { getOrderEmp, changeOrderStatusEmp } = require('../controllers/conemp')


router.put('/emp/order-status', authCheck, employeeCheck, changeOrderStatusEmp)
router.get('/emp/orders', authCheck, employeeCheck, getOrderEmp)

module.exports = router