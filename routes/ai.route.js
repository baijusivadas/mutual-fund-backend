const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/ai/portfolio-analysis', aiController.analyzePortfolio);
router.post('/ai/document-extract', aiController.extractDocument);
router.post('/ai/reports/executive-summary', aiController.generateExecutiveSummary);
router.post('/ai/reports/tax-memo', aiController.generateTaxMemo);
router.post('/ai/alerts', aiController.getAutomatedAlerts);

module.exports = router;

