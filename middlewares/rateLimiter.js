const rateLimit = require('express-rate-limit');

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

// ── General API limiter (100 req / 15 min) ────────────────────────────────────
const limiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
});

// ── Auth-specific limiter (10 req / 15 min) ───────────────────────────────────
// Applied only to /api/auth/* routes in app.js to block brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
});

module.exports = { limiter, authLimiter };