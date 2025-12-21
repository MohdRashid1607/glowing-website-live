const express = require('express');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    verifyPayment
} = require('../controllers/orderController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/new').post(protect, newOrder);
router.route('/verify-payment').post(protect, verifyPayment);
router.route('/me').get(protect, myOrders);
router.route('/:id').get(protect, getSingleOrder);

// Admin routes
router.route('/admin/all').get(protect, authorize('admin'), allOrders);
router.route('/admin/:id').put(protect, authorize('admin'), updateOrder);

module.exports = router;
