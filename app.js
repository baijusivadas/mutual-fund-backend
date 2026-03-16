require("dotenv").config();
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const rateLimiter = require("./middlewares/rateLimiter");
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
const errorHandler = require("./middlewares/errorHandler");

// ─── Startup Guards ─────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS — allowlist from environment ───────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(rateLimiter);

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", transactionRoute);
app.use("/api/auth", authRoute);
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

// ─── 404 Handler (must be before error handler) ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
