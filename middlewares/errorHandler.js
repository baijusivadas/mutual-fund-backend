'use strict';

const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/responseHelper');

module.exports = (err, req, res, _next) => {
  const reqId = req.id || 'no-id';

  // Structured error logging with request ID
  logger.error(`[${reqId}] [${req.method}] ${req.path} - ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let details = err.details || undefined;

  // ── Sequelize Errors ──────────────────────────────────────────────────────
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    errorCode = err.name === 'SequelizeUniqueConstraintError' ? 'CONFLICT' : 'VALIDATION_ERROR';
    const errorMessages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    message = errorMessages.join(', ');
    details = errorMessages;
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'Operation failed: related record not found or constraint violated';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    message = process.env.NODE_ENV === 'production' ? 'A database error occurred' : err.message;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors ? err.errors.map((e) => `${e.path.join('.')}: ${e.message}`) : [];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  }

  // Construct standardized error response
  const body = {
    success: false,
    status: 'error',
    statusCode,
    errorCode,
    message,
    meta: {
      requestId: reqId,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    body.errors = details;
    body.details = details;
  }

  return res.status(statusCode).json(body);
};
