const express = require('express')
const router = express.Router()

// Controller
const { create, list, remove, listby, searchFilters, update, read, createImages, removeImage } = require('../controllers/conproduct')
const { authCheck, adminCheck } = require('../middleware/authCheck')
// @Endpoint http://localhost:5001/api/product
router.post('/product', create)
router.put('/product/:id', update)
router.get('/product/:id', read)
router.get('/products/:count', list)
router.delete('/product/:id', remove)
router.post('/productby', listby)
router.post('/search/filters', searchFilters)
// @Endpoint http://localhost:5001/api/images
router.post('/images', authCheck, adminCheck, createImages)
router.post('/removeimage', authCheck, adminCheck, removeImage)


module.exports = router