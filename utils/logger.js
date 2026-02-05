// logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// 🔹 Function to create a controller-specific logger
const createControllerLogger = (controllerName) => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        (info) =>
          `[${info.timestamp}] ${info.level.toUpperCase()} (${controllerName}): ${info.message}`
      )
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDirectory, `${controllerName}.log`),
      }),
      new winston.transports.Console(),
    ],
  });
};

// Global logger (for generic usage)
const logger = createControllerLogger("app");

// 🔹 Middleware wrapper for HTTP requests
const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};

module.exports = {
  logger, // Default logger
  requestLogger,
  createControllerLogger, // Export factory for controller-specific loggers
};
