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
                        
                        // Mock the currentUser object expected by the frontend
                        const name = "${req.user.name}";
                        const nameParts = name.split(' ');
                        const user = {
                            _id: "${req.user._id}",
                            name: name,
                            firstName: nameParts[0] || name,
                            lastName: nameParts.slice(1).join(' ') || '',
                            email: "${req.user.email}",
                            avatar: "${req.user.avatar}",
                            role: "${req.user.role}",
                            createdAt: "${req.user.createdAt}"
                        };
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        
                        // Small delay to ensure localStorage is written
                        setTimeout(() => {
                            window.location.href = '/frontend/pages/dashboard.html';
                        }, 500);
                    </script>
                    <p>Redirecting to dashboard...</p>
                </body>
            </html>
        `);
    }
);

module.exports = router;
