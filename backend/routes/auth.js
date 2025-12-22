const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    logout,
    getMe
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Successful authentication, redirect to frontend.
        // In a real app, you might want to send a token back or set a cookie
        const token = req.user.getSignedJwtToken();
        res.cookie('token', token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        });
        res.redirect('http://localhost:3000/dashboard'); // Redirect to your frontend dashboard
    }
);

module.exports = router;
