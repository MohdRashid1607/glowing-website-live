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
        const token = req.user.getSignedJwtToken();

        // Instead of a simple redirect, we send a small HTML page that saves the token 
        // to localStorage and then redirects. This is the most reliable way.
        res.send(`
            <html>
                <body>
                    <script>
                        localStorage.setItem('token', '${token}');
                        // Try common frontend ports
                        const ports = [5500, 3000, 5000]; 
                        let redirected = false;
                        
                        // For now redirect to generic dashboard
                        window.location.href = '/frontend/pages/dashboard.html';
                    </script>
                    <p>Redirecting to dashboard...</p>
                </body>
            </html>
        `);
    }
);

module.exports = router;
