'use strict';

require('dotenv').config();
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const requestId = require('./middlewares/requestId');
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
const marketRoute = require('./routes/market.route');
const aiRoute = require('./routes/ai.route');
const organizationRoute = require('./routes/organization.route');
const auditRoute = require('./routes/audit.route');
const financialRoute = require('./routes/financial.route');
const errorHandler = require('./middlewares/errorHandler');

// ─── Startup Guards ─────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn(
    'WARNING: JWT_SECRET is shorter than 32 characters; consider using a stronger secret.'
  );
}

const app = express();

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

// ─── Request Correlation ID (tracing) ─────────────────────────────────────────
app.use(requestId);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:8080,http://localhost:5173,http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(limiter);

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.json({
    status: 'ok',
    success: true,
    service: 'mutual-fund-backend',
    version: '1.0.0',
    ts: new Date().toISOString(),
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoute);
app.use('/api', organizationRoute);
app.use('/api', auditRoute);
app.use('/api', financialRoute);
app.use('/api', marketRoute);
app.use('/api', aiRoute);
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

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 'error',
    statusCode: 404,
    errorCode: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.path} not found`,
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Centralized Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

const defaultPort = 3000;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : defaultPort;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = process.env.PORT_FALLBACK ? parseInt(process.env.PORT_FALLBACK) : 0;
      if (fallbackPort) {
        server.close();
        app.listen(fallbackPort, () => {
          console.log(`⚠️ Port ${PORT} in use. Fallback to port ${fallbackPort}`);
        });
      } else {
        console.error(`❌ Port ${PORT} already in use and no fallback provided.`);
        process.exitCode = 1;
      }
    } else {
      console.error('Server error:', err);
      process.exitCode = 1;
    }
  });
}

module.exports = app;
