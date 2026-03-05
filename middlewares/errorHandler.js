const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
    // Log the error
    logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`);
    if (err.stack) logger.debug(err.stack);

    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Sequelize specific errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        status = 400;
        message = err.errors.map(e => e.message).join(', ');
    } else if (err.name === 'SequelizeDatabaseError') {
        status = 500;
        message = 'Database operation failed';
    }

    res.status(status).json({
        error: message,
        status
    });
};