'use strict';

/**
 * Standardized API Response Helpers
 * Ensures consistent output format across all endpoints while retaining backward compatibility.
 */

/**
 * Standard Success Response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message='Success']
 * @param {number} [statusCode=200]
 * @param {object} [meta={}]
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = {}) => {
  const reqId = res.req ? res.req.id : undefined;

  return res.status(statusCode).json({
    success: true,
    status: 'success', // Preserved for existing frontend compatibility
    statusCode,
    message,
    data,
    meta: {
      requestId: reqId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
};

/**
 * Standard Paginated Response
 * @param {import('express').Response} res
 * @param {Array} items
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 * @param {string} [message='Success']
 * @param {object} [extraMeta={}]
 */
const sendPaginated = (
  res,
  items = [],
  total = 0,
  page = 1,
  limit = 20,
  message = 'Success',
  extraMeta = {}
) => {
  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numLimit = Math.max(1, parseInt(limit, 10) || 20);
  const totalPages = Math.ceil(total / numLimit);

  return sendSuccess(res, items, message, 200, {
    pagination: {
      total,
      page: numPage,
      limit: numLimit,
      totalPages,
      hasNextPage: numPage < totalPages,
      hasPrevPage: numPage > 1,
    },
    ...extraMeta,
  });
};

/**
 * Standard Error Response
 * @param {import('express').Response} res
 * @param {string} [message='Error']
 * @param {number} [statusCode=500]
 * @param {any} [error=null]
 * @param {string} [errorCode=null]
 */
const sendError = (
  res,
  message = 'Error',
  statusCode = 500,
  error = null,
  errorCode = null
) => {
  const reqId = res.req ? res.req.id : undefined;

  const defaultCode =
    errorCode ||
    (statusCode === 400
      ? 'BAD_REQUEST'
      : statusCode === 401
      ? 'UNAUTHORIZED'
      : statusCode === 403
      ? 'FORBIDDEN'
      : statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 409
      ? 'CONFLICT'
      : statusCode === 422
      ? 'UNPROCESSABLE_ENTITY'
      : statusCode === 429
      ? 'RATE_LIMIT_EXCEEDED'
      : 'INTERNAL_SERVER_ERROR');

  const errorDetail = error instanceof Error ? error.message : error;

  return res.status(statusCode).json({
    success: false,
    status: 'error', // Preserved for existing frontend compatibility
    statusCode,
    message,
    errorCode: defaultCode,
    error: errorDetail,
    meta: {
      requestId: reqId,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};
