const express = require('express')
const { authCheck, adminOnly, staffOnly  } = require('../middleware/authCheck')
const router = express.Router()

const { getOrderAdmin, changeOderStatus } = require('../controllers/conadmin')


router.put('/admin/order-status', authCheck, staffOnly, changeOderStatus)
router.get('/admin/orders', authCheck, staffOnly, getOrderAdmin)

module.exports = router