require("dotenv").config();
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const { limiter, authLimiter } = require("./middlewares/rateLimiter");
const { requestLogger } = require("./utils/logger");
const authRoute = require("./routes/auth.route");
const roleRoute = require("./routes/role.route");
const goldRoute = require("./routes/gold.route");
const flatRoute = require("./routes/flat.route");
const rentalRoute = require("./routes/rental.route");
const transactionRoute = require("./routes/transaction.route");
const advancedRoute = require("./routes/advanced.route");
const analyticsRoute = require("./routes/analytics.route");
const realEstateRoute = require("./routes/realEstate.route");
const derivativesRoute = require("./routes/derivatives.route");
const userInvestmentMappingRoute = require("./routes/userInvestmentMapping.route");
const notificationHistoryRoute = require("./routes/notificationHistory.route");
const sidebarRoute = require("./routes/sidebar.route");
const investorRoute = require("./routes/investor.route");
const masterRoute = require("./routes/master.route");
const errorHandler = require("./middlewares/errorHandler");

// ─── Startup Guards ─────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET is shorter than 32 characters; consider using a stronger secret.');
}

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

// ─── CORS — allowlist from environment ───────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

console.log('CORS: Allowed Origins:', ALLOWED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.log('CORS: Blocked Origin:', origin);
      callback(null, false); // Fail CORS without throwing an error to the whole app
    },
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(limiter);

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes get a stricter rate limiter (10 req / 15 min) to block brute-force
app.use("/api/auth", authLimiter, authRoute);
app.use("/api", transactionRoute);
app.use("/api", roleRoute);
app.use("/api", goldRoute);
app.use("/api", flatRoute);
app.use("/api", rentalRoute);
app.use("/api", advancedRoute);
app.use("/api", analyticsRoute);
app.use("/api/real-estate", realEstateRoute);
app.use("/api/derivatives", derivativesRoute);
app.use("/api/user-mappings", userInvestmentMappingRoute);
app.use("/api", sidebarRoute);
app.use("/api/notifications", notificationHistoryRoute);
app.use("/api", investorRoute);
app.use("/api", masterRoute);

// ─── 404 Handler (must be before error handler) ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Not Found" });
});

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler);

const defaultPort = 3000;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : defaultPort;

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
      process.exit(1);
    }
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
