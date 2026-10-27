
// logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

const logDirectory = path.join(__dirname, '../logs');

// Only create log files during local development.
if (!isProduction && !fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const controller = info.controller
      ? ` (${info.controller})`
      : '';

    return `[${info.timestamp}] ${info.level.toUpperCase()}${controller}: ${info.message}`;
  })
);

const transports = [
  new winston.transports.Console()
];

// File logging is local-development only.
if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDirectory, 'app.log'),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
});

const createControllerLogger = (controllerName) =>
  logger.child({ controller: controllerName });

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

module.exports = {
  logger,
  requestLogger,
  createControllerLogger,
};
