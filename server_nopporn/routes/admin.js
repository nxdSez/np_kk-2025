const express = require('express')
const { authCheck, adminOnly, staffOnly  } = require('../middleware/authCheck')
const router = express.Router()
const {changeOrderStatus} = require('../controllers/orderStatus')
const { getOrderAdmin } = require('../controllers/conadmin')
const { searchProductsForPos, searchUsersForPos, createManualOrder } = require('../controllers/adminPos')
const assoc = require('../controllers/adminAssoc')

// Product Associations
router.get('/admin/assoc', authCheck, staffOnly, assoc.listAssoc);
router.post('/admin/assoc', authCheck, staffOnly, assoc.createAssoc);
router.put('/admin/assoc/:id', authCheck, staffOnly, assoc.updateAssoc);
router.delete('/admin/assoc/:id', authCheck, staffOnly, assoc.deleteAssoc);


router.put('/admin/order-status', authCheck, staffOnly, changeOrderStatus)
router.get('/admin/orders', authCheck, staffOnly, getOrderAdmin)

router.get('/admin/search-products', authCheck, staffOnly, searchProductsForPos);
router.get('/admin/search-users', authCheck, staffOnly, searchUsersForPos);
router.post('/admin/manual-orders', authCheck, staffOnly, createManualOrder);

module.exports = router