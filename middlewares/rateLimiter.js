const rateLimit = require('express-rate-limit');


const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);


const limiter = rateLimit({
windowMs: windowMinutes * 60 * 1000,
max,
message: { error: `Too many requests. Please try again later.` }
});


module.exports = limiter;