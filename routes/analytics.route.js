const express = require("express");
const { getPortfolioMetrics } = require("../controllers/analytics.controller");
const authenticate = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/analytics/metrics", authenticate, getPortfolioMetrics);

module.exports = router;
