const express = require('express')
const router = express.Router()
const { create, list, remove } = require('../controllers/concategory')
const { authCheck, adminOnly, staffOnly } = require('../middleware/authCheck')

// ✅ Protected เฉพาะแก้ไข/ลบ
router.post('/category', authCheck, staffOnly, create)
router.delete('/category/:id', authCheck, adminOnly, remove)

// ✅ Public สำหรับอ่าน
router.get('/category', list)
router.get('/categories', list)

module.exports = router
