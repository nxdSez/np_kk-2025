const express = require('express')
const router = express.Router()
const { register, login, } = require('../controllers/conauth')
const { authCheck, adminOnly, staffOnly,currentUser } = require('../middleware/authCheck')

router.post('/register', register)
router.post('/login', login)
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin', authCheck, adminOnly, currentUser)
router.post('/current-employee', authCheck, staffOnly, currentUser)

module.exports = router