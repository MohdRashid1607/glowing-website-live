const Order = require('../models/Order');
const Product = require('../models/Product');
const axios = require('axios');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.newOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paymentMethod
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paymentMethod,
            paidAt: Date.now(),
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, error: 'No Order found with this ID' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/me
// @access  Private
exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Verify PayPal Payment
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { orderID } = req.body;

        // In a real scenario, you'd call PayPal API to verify the order status
        // Here we simulate the verification for sandbox mode

        /*
        // REAL VERIFICATION LOGIC (Example):
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        const response = await axios({
            url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });

        if (response.data.status === 'COMPLETED') {
             // Update order in DB
        }
        */

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully (Sandbox Simulation)'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all orders - ADMIN
// @route   GET /api/orders/admin
// @access  Private/Admin
exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0;

        orders.forEach(order => {
            totalAmount += order.totalPrice;
        });

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update / Process order - ADMIN
// @route   PUT /api/orders/admin/:id
// @access  Private/Admin
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'No Order found with this ID' });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({ success: false, error: 'You have already delivered this order' });
        }

        order.orderItems.forEach(async item => {
            await updateStock(item.product, item.quantity);
        });

        order.orderStatus = req.body.status;
        order.deliveredAt = Date.now();

        await order.save();

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
}
