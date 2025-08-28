const express = require('express')
const { authCheck } = require('../middleware/authCheck')
const router = express.Router()

const { getOrderAdmin, changeOderStatus } = require('../controllers/conadmin')


router.put('/admin/order-status', authCheck, changeOderStatus)
router.get('/admin/orders', authCheck, getOrderAdmin)

module.exports = router