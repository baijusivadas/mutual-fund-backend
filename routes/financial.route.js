'use strict';

const express = require('express');
const {
  calculateXIRR,
  calculateCAGR,
  calculateSIP,
  calculateCapitalGains,
  calculatePortfolioSummary,
} = require('../controllers/financial.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/financial/xirr', calculateXIRR);
router.post('/financial/cagr', calculateCAGR);
router.post('/financial/sip', calculateSIP);
router.post('/financial/capital-gains', calculateCapitalGains);
router.post('/financial/portfolio-summary', calculatePortfolioSummary);

module.exports = router;

