const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log the error with full stack in development
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`);
  if (err.stack) logger.debug(err.stack);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = undefined;

  // ── Sequelize Errors ──────────────────────────────────────────────────────
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    errors = err.errors.map((e) => e.message);
    message = errors.join(', ');
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 409;
    message = 'Operation failed: related record not found or constraint violated';
  } else if (err.name === 'SequelizeDatabaseError') {
    status = 500;
    message = 'Database operation failed';
  } else if (err.name === 'ZodError') {
    status = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  }

  // ── Standardized Response Shape ───────────────────────────────────────────
  // Matches responseHelper.js: { status, message, [errors] }
  const body = {
    status: 'error',
    message,
  };
  if (errors) body.errors = errors;

  res.status(status).json(body);
};