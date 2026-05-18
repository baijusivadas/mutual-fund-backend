const jwt = require('jsonwebtoken');
const { active_sessions } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  // ── JWT verification ────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
    }
    // Unexpected JWT error — let central error handler deal with it
    return next(err);
  }

  // ── Session validation ──────────────────────────────────────────────────
  try {
    const session = await active_sessions.findOne({ where: { token } });
    if (!session) {
      return res.status(401).json({ status: 'error', message: 'Session expired or logged out. Please log in again.' });
    }

    if (new Date() > new Date(session.expires_at)) {
      await session.destroy();
      return res.status(401).json({ status: 'error', message: 'Session expired. Please log in again.' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    // DB or unexpected error — forward to central error handler
    next(err);
  }
};

module.exports = authenticate;
