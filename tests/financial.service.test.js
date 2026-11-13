'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const FinancialService = require('../services/financial.service');

// ─── Precision & Rounding Tests ─────────────────────────────────────────────
test('FinancialService.round rounds correctly and handles null/undefined/NaN', () => {
  assert.equal(FinancialService.round(123.456, 2), 123.46);
  assert.equal(FinancialService.round(123.454, 2), 123.45);
  assert.equal(FinancialService.round(null), 0);
  assert.equal(FinancialService.round(undefined), 0);
  assert.equal(FinancialService.round(NaN), 0);
  assert.equal(FinancialService.roundUnits(123.45678), 123.4568);
});

// ─── Absolute & Percentage Return Tests ─────────────────────────────────────
test('calculateAbsoluteReturn computes gain and percentage correctly for positive return', () => {
  const result = FinancialService.calculateAbsoluteReturn(100000, 125000);
  assert.equal(result.gain, 25000);
  assert.equal(result.returnPercent, 25.0);
});

test('calculateAbsoluteReturn computes gain and percentage correctly for negative return', () => {
  const result = FinancialService.calculateAbsoluteReturn(100000, 85000);
  assert.equal(result.gain, -15000);
  assert.equal(result.returnPercent, -15.0);
});

test('calculateAbsoluteReturn handles zero or negative investment safely', () => {
  const result = FinancialService.calculateAbsoluteReturn(0, 10000);
  assert.equal(result.gain, 0);
  assert.equal(result.returnPercent, 0);
});

// ─── CAGR Tests ─────────────────────────────────────────────────────────────
test('calculateCAGR calculates exact CAGR for known growth over 3 years', () => {
  // 100,000 growing to 133,100 over 3 years = 10% per year
  const cagr = FinancialService.calculateCAGR(100000, 133100, 3);
  assert.equal(cagr, 10.0);
});

test('calculateCAGR calculates negative CAGR for depreciated asset', () => {
  // 100,000 dropping to 80,000 in 1 year = -20%
  const cagr = FinancialService.calculateCAGR(100000, 80000, 1);
  assert.equal(cagr, -20.0);
});

test('calculateCAGR handles invalid inputs gracefully', () => {
  assert.equal(FinancialService.calculateCAGR(0, 10000, 2), 0);
  assert.equal(FinancialService.calculateCAGR(10000, 0, 2), -100);
  assert.equal(FinancialService.calculateCAGR(10000, 12000, 0), 0);
});

test('calculateCAGRFromDates computes annualized rate from calendar dates', () => {
  const cagr = FinancialService.calculateCAGRFromDates(
    100000,
    121000,
    '2022-01-01',
    '2024-01-01'
  );
  // ~10% over 2 years
  assert.ok(cagr >= 9.9 && cagr <= 10.1);
});

// ─── XIRR Tests ─────────────────────────────────────────────────────────────
test('calculateXIRR calculates exact 1-year rate of return for simple flow', () => {
  // Invest 10,000 on 2023-01-01, receive 11,500 on 2024-01-01 -> ~15% XIRR
  const cashFlows = [
    { amount: -10000, date: '2023-01-01' },
    { amount: 11500, date: '2024-01-01' },
  ];
  const rate = FinancialService.calculateXIRR(cashFlows);
  assert.ok(rate !== null);
  assert.ok(rate >= 14.9 && rate <= 15.1, `Expected ~15%, got ${rate}%`);
});

test('calculateXIRR handles multi-installment irregular cash flows', () => {
  const cashFlows = [
    { amount: -50000, date: '2022-01-15' },
    { amount: -50000, date: '2022-07-20' },
    { amount: 15000, date: '2023-03-10' },
    { amount: 110000, date: '2024-01-15' },
  ];
  const rate = FinancialService.calculateXIRR(cashFlows);
  assert.ok(rate !== null);
  assert.ok(typeof rate === 'number' && rate > 0);
});

test('calculateXIRR returns null for invalid cash flow combinations', () => {
  // All negative (no positive return/valuation)
  assert.equal(
    FinancialService.calculateXIRR([
      { amount: -1000, date: '2023-01-01' },
      { amount: -2000, date: '2023-06-01' },
    ]),
    null
  );

  // All positive (no initial investment)
  assert.equal(
    FinancialService.calculateXIRR([
      { amount: 1000, date: '2023-01-01' },
      { amount: 2000, date: '2023-06-01' },
    ]),
    null
  );

  // Fewer than 2 flows
  assert.equal(FinancialService.calculateXIRR([{ amount: -1000, date: '2023-01-01' }]), null);
  assert.equal(FinancialService.calculateXIRR([]), null);
  assert.equal(FinancialService.calculateXIRR(null), null);
});

// ─── SIP Calculator Tests ───────────────────────────────────────────────────
test('calculateSIP computes correct wealth gain and future value for 10,000/mo at 12% for 5 years', () => {
  const result = FinancialService.calculateSIP({
    monthlyInvestment: 10000,
    annualReturnPercent: 12,
    durationYears: 5,
  });

  // Total invested = 10,000 * 60 = 600,000
  assert.equal(result.totalInvested, 600000);

  // Future value of 10k/mo @ 12% for 5 yrs is ~ 824,863.75
  assert.ok(result.futureValue > 820000 && result.futureValue < 830000);
  assert.ok(result.wealthGain > 220000 && result.wealthGain < 230000);
  assert.equal(
    FinancialService.roundCurrency(result.futureValue - result.totalInvested),
    result.wealthGain
  );
});

test('calculateSIP handles 0% return cleanly (future value equals total invested)', () => {
  const result = FinancialService.calculateSIP({
    monthlyInvestment: 5000,
    annualReturnPercent: 0,
    durationYears: 2,
  });

  assert.equal(result.totalInvested, 120000);
  assert.equal(result.futureValue, 120000);
  assert.equal(result.wealthGain, 0);
});

// ─── Capital Gains FIFO Matching Tests ──────────────────────────────────────
test('calculateCapitalGains matches units via FIFO and segregates STCG vs LTCG', () => {
  // Lot 1: 100 units bought on 2022-01-01 @ NAV 100 (Held > 365 days -> LTCG)
  // Lot 2: 100 units bought on 2023-10-01 @ NAV 120 (Held < 365 days -> STCG)
  const purchases = [
    { units: 100, nav: 100, date: '2022-01-01' },
    { units: 100, nav: 120, date: '2023-10-01' },
  ];

  // Redemption: 150 units sold on 2024-01-01 @ NAV 150
  // FIFO matching:
  // 100 units matched from Lot 1 @ cost 100: Gain = 100 * (150 - 100) = +5,000 (LTCG, > 700 days)
  // 50 units matched from Lot 2 @ cost 120: Gain = 50 * (150 - 120) = +1,500 (STCG, ~92 days)
  const redemptions = [{ units: 150, nav: 150, date: '2024-01-01' }];

  const result = FinancialService.calculateCapitalGains(purchases, redemptions, 'equity');

  assert.equal(result.ltcg, 5000);
  assert.equal(result.stcg, 1500);
  assert.equal(result.totalGain, 6500);
  assert.equal(result.tranches.length, 2);

  assert.equal(result.tranches[0].gainType, 'LTCG');
  assert.equal(result.tranches[0].matchedUnits, 100);
  assert.equal(result.tranches[0].gain, 5000);

  assert.equal(result.tranches[1].gainType, 'STCG');
  assert.equal(result.tranches[1].matchedUnits, 50);
  assert.equal(result.tranches[1].gain, 1500);

  // STCG tax @ 20% on 1500 = 300
  assert.equal(result.stcgTaxEstimate, 300);
  // LTCG of 5000 is under 1.25L exemption -> 0 tax
  assert.equal(result.ltcgTaxEstimate, 0);
  assert.equal(result.totalTaxEstimate, 300);
});

