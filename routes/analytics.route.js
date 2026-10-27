const express = require('express');
const { getPortfolioMetrics, getSchemeSummary } = require('../controllers/analytics.controller');
const authenticate = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/analytics/metrics', authenticate, getPortfolioMetrics);
router.get('/analytics/scheme-summary', authenticate, getSchemeSummary);

module.exports = router;
