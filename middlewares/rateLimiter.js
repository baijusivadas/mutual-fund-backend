const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10) * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const authMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '30', 10);

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
    message: `Too many auth attempts. Please try again in ${process.env.RATE_LIMIT_WINDOW_MINUTES || '15'} minutes.`,
  },
});

module.exports = { limiter, authLimiter };
