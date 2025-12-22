const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

router
    .route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), upload.single('image'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin'), upload.single('image'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
