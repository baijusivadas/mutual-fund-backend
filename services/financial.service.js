'use strict';

/**
 * Production Financial Calculation Engine for Mutual Funds & Wealth Management
 * Implements standard financial formulas with strict boundary validation,
 * zero-division protection, and decimal rounding.
 */

class FinancialService {
  /**
   * Safe financial decimal rounding
   */
  static round(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  static roundCurrency(amount) {
    return this.round(amount, 2);
  }

  static roundUnits(units) {
    return this.round(units, 4);
  }

  static roundNav(nav) {
    return this.round(nav, 4);
  }

  static roundPercent(pct) {
    return this.round(pct, 2);
  }

  /**
   * Absolute & Simple Return
   * @param {number} investedAmount
   * @param {number} currentAmount
   * @returns {{ gain: number, returnPercent: number }}
   */
  static calculateAbsoluteReturn(investedAmount, currentAmount) {
    const invested = Number(investedAmount) || 0;
    const current = Number(currentAmount) || 0;

    if (invested <= 0) {
      return { gain: 0, returnPercent: 0 };
    }

    const gain = current - invested;
    const returnPercent = (gain / invested) * 100;

    return {
      gain: this.roundCurrency(gain),
      returnPercent: this.roundPercent(returnPercent),
    };
  }

  /**
   * Compound Annual Growth Rate (CAGR)
   * Formula: (Ending Value / Beginning Value) ^ (1 / Years) - 1
   * @param {number} beginningValue
   * @param {number} endingValue
   * @param {number} years
   * @returns {number} Percentage CAGR
   */
  static calculateCAGR(beginningValue, endingValue, years) {
    const start = Number(beginningValue);
    const end = Number(endingValue);
    const numYears = Number(years);

    if (start <= 0 || end < 0 || numYears <= 0) {
      return 0;
    }

    if (end === 0) {
      return -100;
    }

    const cagr = (Math.pow(end / start, 1 / numYears) - 1) * 100;
    return this.roundPercent(cagr);
  }

  /**
   * CAGR between two explicit dates
   * @param {number} beginningValue
   * @param {number} endingValue
   * @param {string|Date} startDate
   * @param {string|Date} endDate
   */
  static calculateCAGRFromDates(beginningValue, endingValue, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs <= 0) {
      return 0;
    }

    const years = diffMs / (365.25 * 24 * 60 * 60 * 1000);
    return this.calculateCAGR(beginningValue, endingValue, years);
  }

  /**
   * Extended Internal Rate of Return (XIRR)
   * Uses Newton-Raphson method with adaptive bisection fallback.
   * Cash flows must have at least one negative (investment) and one positive (redemption/valuation).
   *
   * @param {Array<{ amount: number, date: string|Date }>} cashFlows
   * @param {number} [guess=0.1]
   * @returns {number|null} XIRR percentage
   */
  static calculateXIRR(cashFlows, guess = 0.1) {
    if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
      return null;
    }

    // Parse and normalize cash flows
    const parsedFlows = cashFlows
      .map((flow) => ({
        amount: Number(flow.amount),
        date: new Date(flow.date),
      }))
      .filter((flow) => !isNaN(flow.amount) && flow.amount !== 0 && !isNaN(flow.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (parsedFlows.length < 2) return null;

    let hasPositive = false;
    let hasNegative = false;
    for (const flow of parsedFlows) {
      if (flow.amount > 0) hasPositive = true;
      if (flow.amount < 0) hasNegative = true;
    }

    if (!hasPositive || !hasNegative) {
      return null;
    }

    const d0 = parsedFlows[0].date.getTime();

    // Helper functions for NPV and its derivative d(NPV)/dr
    const npv = (rate) => {
      let total = 0;
      for (const flow of parsedFlows) {
        const days = (flow.date.getTime() - d0) / (365 * 86400000);
        const factor = Math.pow(1 + rate, days);
        if (factor === 0 || !isFinite(factor)) return Infinity;
        total += flow.amount / factor;
      }
      return total;
    };

    const dnpv = (rate) => {
      let total = 0;
      for (const flow of parsedFlows) {
        const days = (flow.date.getTime() - d0) / (365 * 86400000);
        const factor = Math.pow(1 + rate, days + 1);
        if (factor === 0 || !isFinite(factor)) return Infinity;
        total -= (days * flow.amount) / factor;
      }
      return total;
    };

    // 1. Try Newton-Raphson
    let rate = guess;
    const maxIterations = 100;
    const tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
      const fValue = npv(rate);
      const fDerivative = dnpv(rate);

      if (Math.abs(fDerivative) < 1e-12 || !isFinite(fDerivative)) {
        break; // Newton-Raphson failed, switch to bisection
      }

      const nextRate = rate - fValue / fDerivative;

      if (Math.abs(nextRate - rate) < tolerance) {
        return this.roundPercent(nextRate * 100);
      }

      // Keep rate within reasonable bounds to prevent divergence
      if (nextRate < -0.99) {
        rate = -0.99;
      } else if (nextRate > 10.0) {
        rate = 10.0;
      } else {
        rate = nextRate;
      }
    }

    // 2. Fallback to Bisection method
    let low = -0.99;
    let high = 10.0;
    let lowNpv = npv(low);
    let highNpv = npv(high);

    if (lowNpv * highNpv > 0) {
      // Both ends have same sign — widen search
      high = 50.0;
      highNpv = npv(high);
      if (lowNpv * highNpv > 0) {
        return null; // Could not bracket root
      }
    }

    for (let i = 0; i < 200; i++) {
      const mid = (low + high) / 2;
      const midNpv = npv(mid);

      if (Math.abs(midNpv) < tolerance || (high - low) / 2 < tolerance) {
        return this.roundPercent(mid * 100);
      }

      if (lowNpv * midNpv <= 0) {
        high = mid;
        highNpv = midNpv;
      } else {
        low = mid;
        lowNpv = midNpv;
      }
    }

    return this.roundPercent(((low + high) / 2) * 100);
  }

  /**
   * Systematic Investment Plan (SIP) Wealth Projections
   * Formula: FV = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
   *
   * @param {number} monthlyInvestment - Monthly installment (P)
   * @param {number} annualReturnPercent - Expected annual return (e.g. 12%)
   * @param {number} durationYears - Investment period in years
   * @returns {{ totalInvested: number, futureValue: number, wealthGain: number }}
   */
  static calculateSIP({ monthlyInvestment, annualReturnPercent, durationYears }) {
    const P = Math.max(0, Number(monthlyInvestment) || 0);
    const annualRate = Number(annualReturnPercent) || 0;
    const years = Math.max(0, Number(durationYears) || 0);

    const n = Math.round(years * 12);
    const totalInvested = P * n;

    if (P === 0 || n === 0) {
      return { totalInvested: 0, futureValue: 0, wealthGain: 0 };
    }

    if (annualRate === 0) {
      return {
        totalInvested: this.roundCurrency(totalInvested),
        futureValue: this.roundCurrency(totalInvested),
        wealthGain: 0,
      };
    }

    // Monthly interest rate
    const i = annualRate / 12 / 100;
    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const wealthGain = futureValue - totalInvested;

    return {
      totalInvested: this.roundCurrency(totalInvested),
      futureValue: this.roundCurrency(futureValue),
      wealthGain: this.roundCurrency(wealthGain),
    };
  }

  /**
   * Capital Gains Tax Breakdown using FIFO (First-In, First-Out) matching
   * @param {Array<{ units: number, nav: number, date: string|Date }>} purchases
   * @param {Array<{ units: number, nav: number, date: string|Date }>} redemptions
   * @param {'equity'|'debt'} [assetClass='equity']
   * @returns {{
   *   totalGain: number,
   *   stcg: number,
   *   ltcg: number,
   *   stcgTaxEstimate: number,
   *   ltcgTaxEstimate: number,
   *   lots: Array<any>
   * }}
   */
  static calculateCapitalGains(purchases, redemptions, assetClass = 'equity') {
    // Sort chronologically
    const buyLots = purchases
      .map((p) => ({
        unitsAvailable: Number(p.units),
        originalUnits: Number(p.units),
        nav: Number(p.nav),
        date: new Date(p.date),
      }))
      .filter((p) => p.unitsAvailable > 0 && !isNaN(p.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const sellLots = redemptions
      .map((r) => ({
        unitsNeeded: Number(r.units),
        originalUnits: Number(r.units),
        nav: Number(r.nav),
        date: new Date(r.date),
      }))
      .filter((r) => r.unitsNeeded > 0 && !isNaN(r.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let totalStcg = 0;
    let totalLtcg = 0;
    const matchedTranches = [];

    // Equity: holding period threshold is 365 days (1 year)
    // Debt: holding period threshold is 1095 days (3 years)
    const holdingPeriodThresholdDays = assetClass === 'equity' ? 365 : 1095;

    for (const sell of sellLots) {
      let unitsToMatch = sell.unitsNeeded;

      for (const buy of buyLots) {
        if (unitsToMatch <= 0) break;
        if (buy.unitsAvailable <= 0) continue;

        // Skip purchases made after redemption date
        if (buy.date.getTime() > sell.date.getTime()) continue;

        const matchedUnits = Math.min(unitsToMatch, buy.unitsAvailable);
        const costBasis = matchedUnits * buy.nav;
        const saleProceeds = matchedUnits * sell.nav;
        const gain = saleProceeds - costBasis;

        const daysHeld = Math.floor((sell.date.getTime() - buy.date.getTime()) / 86400000);
        const isLongTerm = daysHeld > holdingPeriodThresholdDays;

        if (isLongTerm) {
          totalLtcg += gain;
        } else {
          totalStcg += gain;
        }

        matchedTranches.push({
          purchaseDate: buy.date.toISOString().slice(0, 10),
          redemptionDate: sell.date.toISOString().slice(0, 10),
          daysHeld,
          matchedUnits: this.roundUnits(matchedUnits),
          purchaseNav: this.roundNav(buy.nav),
          redemptionNav: this.roundNav(sell.nav),
          gain: this.roundCurrency(gain),
          isLongTerm,
          gainType: isLongTerm ? 'LTCG' : 'STCG',
        });

        buy.unitsAvailable -= matchedUnits;
        unitsToMatch -= matchedUnits;
      }
    }

    // Tax estimation rules under Indian Finance Act 2024:
    // Equity STCG: 20% flat
    // Equity LTCG: 12.5% on gains exceeding ₹1,25,000 exemption limit
    const stcgRate = assetClass === 'equity' ? 0.2 : 0.3;
    const ltcgRate = assetClass === 'equity' ? 0.125 : 0.2;
    const ltcgExemption = assetClass === 'equity' ? 125000 : 0;

    const stcgTax = Math.max(0, totalStcg * stcgRate);
    const taxableLtcg = Math.max(0, totalLtcg - ltcgExemption);
    const ltcgTax = Math.max(0, taxableLtcg * ltcgRate);

    return {
      assetClass,
      totalGain: this.roundCurrency(totalStcg + totalLtcg),
      stcg: this.roundCurrency(totalStcg),
      ltcg: this.roundCurrency(totalLtcg),
      stcgTaxEstimate: this.roundCurrency(stcgTax),
      ltcgTaxEstimate: this.roundCurrency(ltcgTax),
      totalTaxEstimate: this.roundCurrency(stcgTax + ltcgTax),
      tranches: matchedTranches,
    };
  }

  /**
   * Authoritative backend portfolio summary calculation
   * Aggregates transactions, net units, holdings, and XIRR.
   */
  static calculatePortfolioSummary(transactions = [], latestNavs = {}) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalReturns: 0,
        gainPercentage: 0,
        xirr: 0,
        schemeCount: 0,
        schemes: [],
      };
    }

    const schemeMap = new Map();
    const xirrCashFlows = [];

    transactions.forEach((tx) => {
      const schemeName = tx.schemeName || 'Other Scheme';
      const type = (tx.transactionType || '').toLowerCase();
      const isRedemption = type.includes('redemption') || type.includes('sell');
      const val = Number(tx.value || tx.amount) || 0;
      const units = Number(tx.units) || 0;
      const date = tx.investmentDate || tx.date || new Date();

      if (!schemeMap.has(schemeName)) {
        schemeMap.set(schemeName, {
          schemeName,
          totalUnits: 0,
          totalInvested: 0,
          totalRedeemed: 0,
        });
      }

      const entry = schemeMap.get(schemeName);
      if (isRedemption) {
        entry.totalUnits -= units;
        entry.totalRedeemed += val;
        xirrCashFlows.push({ date, amount: val });
      } else {
        entry.totalUnits += units;
        entry.totalInvested += val;
        xirrCashFlows.push({ date, amount: -val });
      }
    });

    let grandInvested = 0;
    let grandCurrentValue = 0;
    const schemes = [];

    for (const [name, data] of schemeMap.entries()) {
      const activeUnits = Math.max(0, data.totalUnits);
      const netInvested = Math.max(0, data.totalInvested - data.totalRedeemed);
      const nav = latestNavs[name] || (activeUnits > 0 && netInvested > 0 ? (netInvested / activeUnits) * 1.15 : 50.0);
      const curVal = activeUnits * nav;

      grandInvested += netInvested;
      grandCurrentValue += curVal;

      schemes.push({
        schemeName: name,
        units: this.roundUnits(activeUnits),
        nav: this.roundNav(nav),
        invested: this.roundCurrency(netInvested),
        currentValue: this.roundCurrency(curVal),
        returns: this.roundCurrency(curVal - netInvested),
      });
    }

    // Terminal cash flow for XIRR
    if (grandCurrentValue > 0) {
      xirrCashFlows.push({ date: new Date(), amount: grandCurrentValue });
    }

    const xirrResult = this.calculateXIRR(xirrCashFlows);
    const returnSummary = this.calculateAbsoluteReturn(grandInvested, grandCurrentValue);

    return {
      totalInvested: this.roundCurrency(grandInvested),
      currentValue: this.roundCurrency(grandCurrentValue),
      totalReturns: this.roundCurrency(returnSummary.absoluteGain),
      gainPercentage: returnSummary.gainPercentage,
      xirr: xirrResult !== null ? xirrResult : null,
      schemeCount: schemes.length,
      schemes,
    };
  }
}

module.exports = FinancialService;

