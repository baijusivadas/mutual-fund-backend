const rateLimit = require('express-rate-limit');
const {
  RATE_LIMIT_WINDOW_MINUTES,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MAX,
} = require('../config/constants');

const windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
const max = RATE_LIMIT_MAX;
const authMax = AUTH_RATE_LIMIT_MAX;

// General API limiter — applied to all routes
const limiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
});

// Auth-specific limiter — stricter, applied only to /api/auth/* to block brute-force
const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: `Too many auth attempts. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes.`,
  },
});

module.exports = { limiter, authLimiter };
