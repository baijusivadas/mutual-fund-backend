
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const { limiter, authLimiter } = require('./middlewares/rateLimiter');
const { requestLogger } = require('./utils/logger');

const authRoute = require('./routes/auth.route');
const roleRoute = require('./routes/role.route');
const goldRoute = require('./routes/gold.route');
const flatRoute = require('./routes/flat.route');
const rentalRoute = require('./routes/rental.route');
const transactionRoute = require('./routes/transaction.route');
const advancedRoute = require('./routes/advanced.route');
const analyticsRoute = require('./routes/analytics.route');
const realEstateRoute = require('./routes/realEstate.route');
const derivativesRoute = require('./routes/derivatives.route');
const userInvestmentMappingRoute = require('./routes/userInvestmentMapping.route');
const notificationHistoryRoute = require('./routes/notificationHistory.route');
const sidebarRoute = require('./routes/sidebar.route');
const investorRoute = require('./routes/investor.route');
const masterRoute = require('./routes/master.route');
const userInvestmentRoute = require('./routes/userInvestment.route');
const chatRoute = require('./routes/chat.route');

const errorHandler = require('./middlewares/errorHandler');

// ─── Startup Guards ──────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters.');
}

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Set ALLOWED_ORIGINS in Vercel to your exact frontend origin.
// Multiple origins can be comma-separated.
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:8080,https://mutual-fund-frontend-xi.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permit requests without Origin (e.g. health checks and server-to-server).
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }

      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use(limiter);

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Files ────────────────────────────────────────────────────────────
// Vercel does not serve files through express.static() in the usual way.
// Keep this for local development; use a persistent external store for uploads
// in production if the application needs uploaded files to remain available.
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mutual Fund API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoute);
app.use('/api', transactionRoute);
app.use('/api', roleRoute);
app.use('/api', goldRoute);
app.use('/api', flatRoute);
app.use('/api', rentalRoute);
app.use('/api', advancedRoute);
app.use('/api', analyticsRoute);
app.use('/api/real-estate', realEstateRoute);
app.use('/api/derivatives', derivativesRoute);
app.use('/api/user-mappings', userInvestmentMappingRoute);
app.use('/api', sidebarRoute);
app.use('/api/notifications', notificationHistoryRoute);
app.use('/api', investorRoute);
app.use('/api', masterRoute);
app.use('/api', userInvestmentRoute);
app.use('/api', chatRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
  });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Local Development / Vercel Export ───────────────────────────────────────
// Vercel manages the request lifecycle. Do not start a separate listener there.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
