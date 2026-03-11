require("dotenv").config();
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("./middlewares/rateLimiter");
const authRoute = require("./routes/auth.route");
const roleRoute = require("./routes/role.route");
const goldRoute = require("./routes/gold.route");
const flatRoute = require("./routes/flat.route");
const rentalRoute = require("./routes/rental.route");
const transactionRoute = require("./routes/transaction.route");
const advancedRoute = require("./routes/advanced.route");
const analyticsRoute = require("./routes/analytics.route"); // Added analytics route
const realEstateRoute = require("./routes/realEstate.route");
const derivativesRoute = require("./routes/derivatives.route");
const userInvestmentMappingRoute = require("./routes/userInvestmentMapping.route");
const notificationHistoryRoute = require("./routes/notificationHistory.route");
const sidebarRoute = require("./routes/sidebar.route");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Serve uploaded documents statically
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

app.use("/api", transactionRoute);
app.use("/api/auth", authRoute);
app.use("/api", roleRoute);
app.use("/api", goldRoute);
app.use("/api", flatRoute);
app.use("/api", rentalRoute);
app.use("/api", advancedRoute);
app.use("/api", analyticsRoute); // Registered analytics route
app.use("/api/real-estate", realEstateRoute);
app.use("/api/derivatives", derivativesRoute);
app.use("/api/user-mappings", userInvestmentMappingRoute);
app.use("/api", sidebarRoute);
app.use("/api/notifications", notificationHistoryRoute);

// centralized error handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
