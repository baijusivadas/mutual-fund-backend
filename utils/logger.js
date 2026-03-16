// logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Single shared logger — avoids creating multiple file handles at startup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((info) => {
      const controller = info.controller ? ` (${info.controller})` : "";
      return `[${info.timestamp}] ${info.level.toUpperCase()}${controller}: ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "app.log"),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.Console(),
  ],
});

/**
 * Returns a child logger bound to a specific controller name.
 * Uses Winston's child() — no new file handles created.
 */
const createControllerLogger = (controllerName) => {
  return logger.child({ controller: controllerName });
};

// HTTP request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
};

module.exports = {
  logger,
  requestLogger,
  createControllerLogger,
};
