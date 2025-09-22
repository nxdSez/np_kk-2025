const express = require('express')
const router = express.Router()
const { register, login, currentUser,} = require('../controllers/conauth')
const { authCheck, adminCheck} = require('../middleware/authCheck')

router.post('/register', register)
router.post('/login', login)
router.post('/current-user',authCheck, currentUser)
router.post('/current-admin',authCheck ,adminCheck, currentUser)
router.post('/current-employee',authCheck ,employeeCheck, currentUser)

module.exports = router