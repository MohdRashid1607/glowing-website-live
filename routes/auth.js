const express = require('express');
const router = express.Router();
const User = require('../models/user');

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = new User({ name, email, password });
        await user.save();

        res.json({ message: "Signup successful", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// SIGNIN
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.json({ message: "Signin successful", user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
