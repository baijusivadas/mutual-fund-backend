'use strict';

const crypto = require('crypto');

/**
 * Middleware to trace incoming requests with a unique correlation ID.
 * Uses client-provided X-Request-Id if present, otherwise generates a secure UUID.
 */
const requestId = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const id = incomingId && typeof incomingId === 'string' && incomingId.length <= 128
    ? incomingId
    : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

module.exports = requestId;

