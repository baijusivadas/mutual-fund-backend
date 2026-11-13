'use strict';

const jwt = require('jsonwebtoken');
const { active_sessions, auth_users } = require('../models');

const authenticate = async (req, res, next) => {
  // Support both Authorization Bearer header and secure HttpOnly cookie
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );
    token = cookies.token || cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 'error',
      statusCode: 401,
      errorCode: 'AUTHENTICATION_REQUIRED',
      error: 'Authentication required',
      message: 'Authentication required',
    });
  }

  // ── JWT verification ────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'TOKEN_EXPIRED',
        error: 'Token expired. Please log in again.',
        message: 'Token expired. Please log in again.',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'INVALID_TOKEN',
        error: 'Invalid token. Please log in again.',
        message: 'Invalid token. Please log in again.',
      });
    }
    return next(err);
  }

  // ── Session validation ──────────────────────────────────────────────────
  try {
    const session = await active_sessions.findOne({ where: { token } });
    if (!session) {
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'SESSION_EXPIRED',
        error: 'Session expired or logged out. Please log in again.',
        message: 'Session expired or logged out. Please log in again.',
      });
    }

    if (new Date() > new Date(session.expires_at)) {
      await session.destroy();
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'SESSION_EXPIRED',
        error: 'Session expired. Please log in again.',
        message: 'Session expired. Please log in again.',
      });
    }

    let tenantId = decoded.tenantId || decoded.tenant_id;
    if (!tenantId && auth_users) {
      const dbUser = await auth_users.findByPk(decoded.id, { attributes: ['tenant_id'] });
      if (dbUser && dbUser.tenant_id) {
        tenantId = dbUser.tenant_id;
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      tenantId: tenantId || null,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
