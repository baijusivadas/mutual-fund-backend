/**
 * sanitizeString — trims whitespace and strips common HTML injection characters.
 * @param {string} val
 * @returns {string}
 */
const sanitizeString = (val) =>
  val.trim().replace(/[<>"'`]/g, '');

/**
 * validate(schema, source?)
 *
 * Validates and sanitizes request inputs.
 *
 * @param {Object} schema        - Field rules map.
 * @param {'body'|'params'|'query'} [source='body'] - Which part of req to validate.
 *
 * Supported rules per field:
 *   required   {boolean}  — field must be present and non-empty
 *   type       {string}   — typeof check ('string', 'number', 'boolean')
 *   pattern    {RegExp}   — regex test (strings only)
 *   minLength  {number}   — minimum string length
 *   maxLength  {number}   — maximum string length
 *   min        {number}   — minimum numeric value
 *   max        {number}   — maximum numeric value
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const data = req[source] || {};
  const errors = [];

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    let value = data[field];

    // ── Sanitize strings in-place ────────────────────────────────────────
    if (typeof value === 'string') {
      value = sanitizeString(value);
      // Write back the sanitized value so controllers receive clean data
      req[source][field] = value;
    }

    // ── Required ─────────────────────────────────────────────────────────
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      return; // skip further checks for this field
    }

    // Skip remaining checks if the field is absent and not required
    if (value === undefined || value === null || value === '') return;

    // ── Type ──────────────────────────────────────────────────────────────
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
    }

    // ── Pattern ───────────────────────────────────────────────────────────
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }

    // ── String length ─────────────────────────────────────────────────────
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
    }

    // ── Numeric range ─────────────────────────────────────────────────────
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = validate;
