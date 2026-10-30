/**
 * Centralized Backend Constants & Configuration Defaults.
 * All magic numbers and default fallback settings are loaded dynamically
 * with process.env overrides.
 */

const DEFAULT_PAGE = parseInt(process.env.DEFAULT_PAGE, 10) || 1;
const DEFAULT_PAGE_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 20;
const MAX_PAGE_LIMIT = parseInt(process.env.MAX_PAGE_LIMIT, 10) || 100;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SESSION_DURATION_MS =
  parseInt(process.env.SESSION_DURATION_MS, 10) || 24 * 60 * 60 * 1000; // 24 hours

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

const RATE_LIMIT_WINDOW_MINUTES =
  parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 30;

const DEFAULT_ALLOWED_ORIGINS =
  'http://localhost:8080,https://mutual-fund-frontend-xi.vercel.app';

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  JWT_EXPIRES_IN,
  SESSION_DURATION_MS,
  DEFAULT_PORT,
  RATE_LIMIT_WINDOW_MINUTES,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MAX,
  DEFAULT_ALLOWED_ORIGINS,
};
