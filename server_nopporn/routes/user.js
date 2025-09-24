const express = require('express')
const router = express.Router()
const { authCheck, adminOnly, staffOnly } = require('../middleware/authCheck')
const {
  listUsers,
  changeStatus,
  changeRole,
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  saveOrder,
  getOrder,
  getAllOrders

} = require('../controllers/conuser')

router.get('/users', authCheck, adminOnly, listUsers)
router.post('/change-status', authCheck, adminOnly, changeStatus)
router.post('/change-role', authCheck, adminOnly, changeRole)

router.post('/user/cart', authCheck, userCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyCart)

router.post('/user/address', authCheck, saveAddress)

router.post('/user/order', authCheck, saveOrder)
router.get('/user/order', authCheck, getOrder)



module.exports = router