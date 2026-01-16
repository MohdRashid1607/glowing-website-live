const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversation,
    clearConversation,
    getSuggestions
} = require('../controllers/chatbot');

// Optional auth middleware - chatbot works for both authenticated and guest users
const { protect } = require('../middleware/auth');

// Apply optional authentication - if token exists, attach user to request
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        protect(req, res, next);
    } else {
        next();
    }
};

// Routes
router.post('/message', optionalAuth, sendMessage);
router.get('/conversation/:sessionId', getConversation);
router.delete('/conversation/:sessionId', clearConversation);
router.get('/suggestions', getSuggestions);

module.exports = router;
