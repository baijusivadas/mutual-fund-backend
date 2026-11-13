'use strict';

module.exports = {
  DEFAULT_PORT: 3000,
  DEFAULT_ALLOWED_ORIGINS: 'http://localhost:8080,http://localhost:5173,http://localhost:3000',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
};

