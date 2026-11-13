const test = require('node:test');
const assert = require('node:assert/strict');
const MarketService = require('../services/market.service');
const PortfolioAiService = require('../services/portfolioAi.service');
const AiReportService = require('../services/aiReport.service');
const AiAlertService = require('../services/aiAlert.service');
const DocumentExtractionService = require('../services/documentExtraction.service');

test('MarketService returns benchmark indices with Nifty 50 and Sensex', async () => {
  const indices = await MarketService.getIndices();
  assert.ok(Array.isArray(indices), 'Indices must be an array');
  assert.ok(indices.length >= 5, 'Should return at least 5 benchmark indices');

  const nifty = indices.find((i) => i.symbol === 'NIFTY 50');
  assert.ok(nifty, 'Nifty 50 must be present');
  assert.ok(nifty.value > 20000, 'Nifty value must be realistic');

  const sensex = indices.find((i) => i.symbol === 'SENSEX');
  assert.ok(sensex, 'Sensex must be present');
  assert.ok(sensex.value > 70000, 'Sensex value must be realistic');
});

test('MarketService getQuote fetches single quote by symbol or name', async () => {
  const gold = await MarketService.getQuote('GOLD24K');
  assert.ok(gold, 'Gold quote must exist');
  assert.equal(gold.symbol, 'GOLD24K');
  assert.ok(gold.value > 50000, 'Gold price must exceed 50k');
});

test('PortfolioAiService performs health diagnostics and computes diversification score', async () => {
  const portfolio = {
    totalCurrentValue: 2500000,
    totalInvested: 2000000,
    holdings: [
      { name: 'HDFC Flexi Cap Fund', currentValue: 500000 },
      { name: 'SBI Bluechip Fund', currentValue: 400000 },
      { name: 'ICICI Prudential Value Discovery', currentValue: 300000 },
      { name: 'Physical Gold Sovereign Bonds', currentValue: 250000 },
    ],
    assetBreakdown: {
      equity: 1750000, // 70%
      debt: 400000,   // 16%
      gold: 250000,   // 10%
      real_estate: 50000,
      cash: 50000,
    },
  };

  const analysis = await PortfolioAiService.analyzePortfolio(portfolio, 'moderate');

  assert.ok(analysis.healthRating, 'Must provide health rating');
  assert.ok(analysis.diversificationScore >= 0 && analysis.diversificationScore <= 100, 'Diversification score must be 0-100');
  assert.equal(analysis.actualAllocation.equity, 70, 'Equity must reflect 70%');
  assert.ok(analysis.drift.equity !== undefined, 'Must calculate equity drift');
  assert.ok(analysis.riskMetrics.portfolioBeta > 0, 'Beta must be calculated');
  assert.ok(analysis.riskMetrics.annualizedVolatility > 0, 'Volatility must be calculated');
  assert.ok(analysis.riskMetrics.valueAtRisk95.estimatedLossAmount > 0, 'VaR must be calculated');
  assert.ok(Array.isArray(analysis.recommendations), 'Recommendations must be an array');
});

test('AiReportService generates executive summary and tax harvesting memo', async () => {
  const portfolio = {
    totalCurrentValue: 3000000,
    totalInvested: 2400000,
    holdings: [{ name: 'Parag Parikh Flexi Cap', currentValue: 600000 }],
    assetBreakdown: { equity: 1800000, debt: 800000, gold: 400000 },
  };

  const exec = await AiReportService.generateExecutiveSummary(portfolio, 'Rajesh Babu');
  assert.equal(exec.reportType, 'EXECUTIVE_PORTFOLIO_SUMMARY');
  assert.equal(exec.clientName, 'Rajesh Babu');
  assert.ok(exec.keyHighlights.totalNetWorth > 0);

  const taxMemo = await AiReportService.generateTaxHarvestingMemo(
    { stcgTotal: 60000, ltcgTotal: 190000 },
    'Rajesh Babu'
  );
  assert.equal(taxMemo.reportType, 'TAX_HARVESTING_MEMO');
  assert.equal(taxMemo.taxPosition.ltcgExemptionLimit, 125000, 'Exemption limit must be 1.25L');
  assert.ok(taxMemo.taxPosition.totalTaxLiability > 0, 'Tax liability must be positive');
  assert.ok(taxMemo.actionableStrategies.length > 0, 'Must have tax strategies');
});

test('AiAlertService triggers automated alerts for drift and milestones', async () => {
  const alertsData = await AiAlertService.evaluateAlerts({
    totalCurrentValue: 2187000,
    totalInvested: 1894000,
    totalSipContributed: 172000,
    assetBreakdown: { equity: 1750000, debt: 200000, gold: 100000 },
  });

  assert.ok(alertsData.activeAlertsCount >= 1, 'Should trigger at least 1 alert');
  assert.ok(Array.isArray(alertsData.alerts), 'Alerts must be an array');

  const sipMilestone = alertsData.alerts.find((a) => a.type === 'milestone');
  assert.ok(sipMilestone, 'SIP milestone alert should be generated for > 1 Lakh contributions');
});

test('DocumentExtractionService structures CAS statement text into transactions', async () => {
  const sampleCas = `
Consolidated Account Statement
Investor: Ananya Sharma
PAN: ABCDE1234F
Folio No: 40598712/99
HDFC Flexi Cap Fund - Direct Growth
15-Jan-2025 Purchase ₹5,000.00 45.234 110.53
20-Feb-2025 SIP Purchase ₹5,000.00 43.120 115.95
10-Mar-2025 Redemption ₹2,500.00 21.050 118.76
`;

  const extracted = await DocumentExtractionService.extractDocument({
    rawText: sampleCas,
    documentType: 'CAS',
  });

  assert.equal(extracted.investor.pan, 'ABCDE1234F', 'PAN must be extracted');
  assert.ok(extracted.transactions.length >= 2, 'Should extract at least 2 transactions');
  assert.ok(extracted.summary.totalPurchases >= 5000, 'Total purchases should be calculated');
});

