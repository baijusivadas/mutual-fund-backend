const { sendError } = require("../utils/responseHelper");

/**
 * Generic validation middleware using Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} property 
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req[property]);
      // Update req[property] with the sanitized/parsed data
      req[property] = result;
      next();
    } catch (err) {
      // Errors will be caught by the centralized error handler if they are ZodErrors
      next(err);
    }
  };
};

module.exports = validate;
