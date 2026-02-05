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
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();
require("express-async-errors");

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get("/", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

app.use("/api", transactionRoute);
app.use("/api", authRoute);
app.use("/api", roleRoute);
app.use("/api", goldRoute);
app.use("/api", flatRoute);
app.use("/api", rentalRoute);

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
