const express = require('express')
const { authCheck, adminCheck } = require('../middleware/authCheck')
const router = express.Router()

const { getOrderAdmin, changeOderStatus } = require('../controllers/conadmin')


router.put('/admin/order-status', authCheck, adminCheck, changeOderStatus)
router.get('/admin/orders', authCheck, adminCheck, getOrderAdmin)

module.exports = router