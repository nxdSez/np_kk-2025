const express = require('express')
const router = express.Router()
const { create, list, remove } = require('../controllers/concategory')
const { authCheck, adminOnly, staffOnly } = require('../middleware/authCheck')

router.post('/category', authCheck, staffOnly, create)
router.get('/category', list, staffOnly)
router.delete('/category/:id', authCheck, adminOnly, remove)

module.exports = router