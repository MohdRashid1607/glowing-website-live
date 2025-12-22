const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // Handle image upload with Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'products'
            });

            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } else {
            return res.status(400).json({ success: false, error: 'Please upload an image' });
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Handle image update
        if (req.file) {
            // Delete old image from Cloudinary
            if (product.image && product.image.public_id) {
                await cloudinary.uploader.destroy(product.image.public_id);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'products'
            });

            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Delete image from Cloudinary
        if (product.image && product.image.public_id) {
            await cloudinary.uploader.destroy(product.image.public_id);
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
