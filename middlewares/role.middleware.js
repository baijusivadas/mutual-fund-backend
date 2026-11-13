'use strict';

const { hasPermission } = require('../config/permissions');
const { sendError } = require('../utils/responseHelper');

/**
 * Authorize middleware checking user roles
 * @param {string[]} allowedRoles
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'AUTHENTICATION_REQUIRED',
        error: 'Authentication required',
        message: 'Authentication required',
      });
    }

    // SuperAdmin bypass: allow all access
    if (req.user.role === 'superAdmin') {
      return next();
    }

    // Check if user role is in the allowed list
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        status: 'error',
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        error: 'Access denied: insufficient permissions',
        message: 'Access denied: insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Require a specific permission from PERMISSIONS matrix
 * @param {string} permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: 'error',
        statusCode: 401,
        errorCode: 'AUTHENTICATION_REQUIRED',
        error: 'Authentication required',
        message: 'Authentication required',
      });
    }

    if (req.user.role === 'superAdmin') {
      return next();
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        status: 'error',
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        error: `Access denied: requires '${permission}' permission`,
        message: `Access denied: requires '${permission}' permission`,
      });
    }

    next();
  };
};

authorize.requirePermission = requirePermission;
authorize.authorize = authorize;

module.exports = authorize;
