const PortfolioAiService = require('../services/portfolioAi.service');
const DocumentExtractionService = require('../services/documentExtraction.service');
const AiReportService = require('../services/aiReport.service');
const AiAlertService = require('../services/aiAlert.service');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Controller for BrickWealth Phase 3 AI Intelligence Suite.
 */
const analyzePortfolio = async (req, res) => {
  try {
    const { portfolio, riskProfile } = req.body;
    const result = await PortfolioAiService.analyzePortfolio(portfolio || {}, riskProfile || 'moderate');
    return sendSuccess(res, result, 'Portfolio analysis completed successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

const extractDocument = async (req, res) => {
  try {
    const { rawText, documentType } = req.body;
    if (!rawText) {
      return sendError(res, 'rawText content is required for extraction', 400);
    }
    const result = await DocumentExtractionService.extractDocument({ rawText, documentType });
    return sendSuccess(res, result, 'Document extracted successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

const generateExecutiveSummary = async (req, res) => {
  try {
    const { portfolio, clientName } = req.body;
    const report = await AiReportService.generateExecutiveSummary(portfolio || {}, clientName);
    return sendSuccess(res, report, 'Executive summary report generated successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

const generateTaxMemo = async (req, res) => {
  try {
    const { capitalGainsData, clientName } = req.body;
    const memo = await AiReportService.generateTaxHarvestingMemo(capitalGainsData || {}, clientName);
    return sendSuccess(res, memo, 'Tax harvesting advisory memo generated successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

const getAutomatedAlerts = async (req, res) => {
  try {
    const portfolio = req.body || {};
    const alerts = await AiAlertService.evaluateAlerts(portfolio);
    return sendSuccess(res, alerts, 'Active AI alerts evaluated successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

module.exports = {
  analyzePortfolio,
  extractDocument,
  generateExecutiveSummary,
  generateTaxMemo,
  getAutomatedAlerts,
};

