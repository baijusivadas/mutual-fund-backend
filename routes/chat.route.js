const express = require('express');
const { handleChat } = require('../controllers/chat.controller');
const authenticate = require('../middlewares/auth.middleware');
const { tenantMiddleware } = require('../middlewares/tenant.middleware');
const rateLimit = require('express-rate-limit');

// Dedicated rate limiter for AI chat requests
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute
  message: {
    success: false,
    status: 'error',
    statusCode: 429,
    errorCode: 'TOO_MANY_REQUESTS',
    message: 'Too many chat requests. Please wait a moment before sending more messages.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Enforce authentication, tenant scoping, and rate limiting on all chat interactions
router.post('/chat', chatLimiter, authenticate, tenantMiddleware, handleChat);
router.post('/chat/route', chatLimiter, authenticate, tenantMiddleware, handleChat);

module.exports = router;
