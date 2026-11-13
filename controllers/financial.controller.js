'use strict';

const FinancialService = require('../services/financial.service');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const calculateXIRR = async (req, res) => {
  const { cashFlows, guess } = req.body;
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
    return sendError(
      res,
      'Invalid cashFlows: at least two cash flow entries with amount and date are required',
      400,
      null,
      'INVALID_CASH_FLOWS'
    );
  }

  const xirr = FinancialService.calculateXIRR(cashFlows, guess);
  if (xirr === null) {
    return sendError(
      res,
      'Could not converge on XIRR. Verify that cash flows contain both positive and negative values with valid dates.',
      422,
      null,
      'XIRR_CALCULATION_FAILED'
    );
  }

  return sendSuccess(res, { xirr: `${xirr}%`, rate: xirr }, 'XIRR calculated successfully');
};

const calculateCAGR = async (req, res) => {
  const { beginningValue, endingValue, years, startDate, endDate } = req.body;

  let cagr;
  if (startDate && endDate) {
    cagr = FinancialService.calculateCAGRFromDates(beginningValue, endingValue, startDate, endDate);
  } else {
    cagr = FinancialService.calculateCAGR(beginningValue, endingValue, years);
  }

  return sendSuccess(res, { cagr: `${cagr}%`, rate: cagr }, 'CAGR calculated successfully');
};

const calculateSIP = async (req, res) => {
  const { monthlyInvestment, annualReturnPercent, durationYears } = req.body;
  if (!monthlyInvestment || !durationYears) {
    return sendError(
      res,
      'monthlyInvestment and durationYears are required',
      400,
      null,
      'MISSING_REQUIRED_FIELDS'
    );
  }

  const result = FinancialService.calculateSIP({
    monthlyInvestment,
    annualReturnPercent,
    durationYears,
  });

  return sendSuccess(res, result, 'SIP projections calculated successfully');
};

const calculateCapitalGains = async (req, res) => {
  const { purchases, redemptions, assetClass } = req.body;
  if (!Array.isArray(purchases) || !Array.isArray(redemptions)) {
    return sendError(
      res,
      'purchases and redemptions arrays are required',
      400,
      null,
      'MISSING_REQUIRED_FIELDS'
    );
  }

  const result = FinancialService.calculateCapitalGains(purchases, redemptions, assetClass);
  return sendSuccess(res, result, 'Capital gains calculated successfully');
};

const calculatePortfolioSummary = async (req, res) => {
  const { transactions, latestNavs } = req.body;
  const result = FinancialService.calculatePortfolioSummary(transactions || [], latestNavs || {});
  return sendSuccess(res, result, 'Portfolio summary calculated successfully');
};

module.exports = {
  calculateXIRR,
  calculateCAGR,
  calculateSIP,
  calculateCapitalGains,
  calculatePortfolioSummary,
};

