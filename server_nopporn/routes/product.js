const express = require('express')
const router = express.Router()

// Controller
const { create, list, remove, listby, searchFilters, update, read, createImages, removeImage } = require('../controllers/conproduct')
const { authCheck, adminOnly, staffOnly } = require('../middleware/authCheck')
const { getRelatedProducts } = require('../controllers/productPublic');
// @Endpoint http://localhost:5001/api/product
router.post('/product', authCheck, staffOnly, create)
router.put('/product/:id', authCheck, staffOnly, update)
router.get('/product/:id', read)
router.get('/products/:count', list)
router.delete('/product/:id', authCheck, staffOnly, remove)
router.post('/productby', listby)
router.post('/search/filters', searchFilters)
router.get('/products/:id/related', getRelatedProducts);
// @Endpoint http://localhost:5001/api/images
router.post('/images', authCheck, staffOnly, createImages)
router.post('/removeimage', authCheck, staffOnly, removeImage)


module.exports = router