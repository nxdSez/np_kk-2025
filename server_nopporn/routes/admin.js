const express = require('express')
const { authCheck, adminOnly, staffOnly  } = require('../middleware/authCheck')
const router = express.Router()
const {changeOrderStatus} = require('../controllers/orderStatus')
const { getOrderAdmin } = require('../controllers/conadmin')


router.put('/admin/order-status', authCheck, staffOnly, changeOrderStatus)
router.get('/admin/orders', authCheck, staffOnly, getOrderAdmin)

module.exports = router