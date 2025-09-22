const express = require('express')
const { authCheck, adminCheck, employeeCheck } = require('../middleware/authCheck')
const router = express.Router()

const { getOrderAdmin, changeOderStatus } = require('../controllers/conadmin')


router.put('/admin/order-status', authCheck, adminCheck, employeeCheck , changeOderStatus)
router.get('/admin/orders', authCheck, adminCheck, employeeCheck , getOrderAdmin)

module.exports = router