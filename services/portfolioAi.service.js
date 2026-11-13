const FinancialService = require('./financial.service');
const MarketService = require('./market.service');

// Target asset allocation benchmarks by risk profile
const TARGET_ALLOCATION_PROFILES = {
  conservative: { equity: 25, debt: 60, gold: 10, real_estate: 0, cash: 5 },
  moderate: { equity: 50, debt: 30, gold: 10, real_estate: 5, cash: 5 },
  aggressive: { equity: 70, debt: 15, gold: 10, real_estate: 0, cash: 5 },
};

class PortfolioAiService {
  /**
   * Run comprehensive diagnostic analysis on a portfolio.
   * @param {Object} portfolioData
   * @param {number} portfolioData.totalCurrentValue
   * @param {number} portfolioData.totalInvested
   * @param {Array} portfolioData.holdings - [{ name, type, currentValue, category }]
   * @param {Object} portfolioData.assetBreakdown - { equity, debt, gold, real_estate, cash }
   * @param {string} [riskProfile='moderate']
   */
  static async analyzePortfolio(portfolioData, riskProfile = 'moderate') {
    const profile = TARGET_ALLOCATION_PROFILES[riskProfile.toLowerCase()] || TARGET_ALLOCATION_PROFILES.moderate;

    const totalValue = Number(portfolioData.totalCurrentValue) || 0;
    const totalInvested = Number(portfolioData.totalInvested) || 0;
    const holdings = Array.isArray(portfolioData.holdings) ? portfolioData.holdings : [];
    const breakdown = portfolioData.assetBreakdown || {
      equity: totalValue * 0.55,
      debt: totalValue * 0.25,
      gold: totalValue * 0.10,
      real_estate: totalValue * 0.05,
      cash: totalValue * 0.05,
    };

    // 1. Calculate Returns
    const returnSummary = FinancialService.calculateAbsoluteReturn(totalInvested, totalValue);

    // 2. Asset Allocation Drift Check
    const actualAllocation = {};
    const drift = {};
    const totalAssetSum = Object.values(breakdown).reduce((acc, v) => acc + (Number(v) || 0), 0) || totalValue || 1;

    for (const [asset, targetPct] of Object.entries(profile)) {
      const assetVal = Number(breakdown[asset]) || 0;
      const actualPct = FinancialService.round((assetVal / totalAssetSum) * 100, 2);
      actualAllocation[asset] = actualPct;
      drift[asset] = FinancialService.round(actualPct - targetPct, 2);
    }

    // 3. Diversification & Concentration Risk (Herfindahl-Hirschman Index)
    let hhi = 0;
    const concentrationRisks = [];
    holdings.forEach((h) => {
      const hVal = Number(h.currentValue) || 0;
      const weightPct = totalValue > 0 ? (hVal / totalValue) * 100 : 0;
      hhi += (weightPct * weightPct);

      if (weightPct > 20) {
        concentrationRisks.push({
          schemeName: h.name || 'Unnamed Asset',
          weight: FinancialService.round(weightPct, 2),
          currentValue: hVal,
          warning: `Holding constitutes ${FinancialService.round(weightPct, 1)}% of your net worth (>20% threshold).`,
        });
      }
    });

    // Score from 0 to 100: lower HHI = higher diversification
    // HHI < 1500 is considered well diversified
    const diversificationScore = Math.max(10, Math.min(100, Math.round(100 - (hhi / 100))));

    // 4. Risk & Volatility Metrics
    // Indian 10Y G-Sec benchmark risk-free rate
    const liveIndices = await MarketService.getIndices();
    const gSecQuote = liveIndices.find((i) => i.symbol === 'IN10Y_GSEC');
    const riskFreeRate = gSecQuote ? Number(gSecQuote.value) : 6.82;

    // Approximate portfolio Beta and Standard Deviation from equity exposure
    const equityPct = (actualAllocation.equity || 50) / 100;
    const estimatedBeta = FinancialService.round(0.75 + equityPct * 0.45, 2); // 0.75 to 1.20 range
    const estimatedVolatility = FinancialService.round(8.5 + equityPct * 8.0, 2); // 8.5% to 16.5% range

    // Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Volatility
    // Assuming portfolio annualized return proxy from absolute return or 12% default
    const annualizedProxy = returnSummary.gainPercentage > 0 ? Math.min(returnSummary.gainPercentage, 16.5) : 12.0;
    const sharpeRatio = estimatedVolatility > 0
      ? FinancialService.round((annualizedProxy - riskFreeRate) / estimatedVolatility, 2)
      : 0;

    // Value at Risk (VaR 95% 1-month): 1.65 * Volatility / sqrt(12)
    const monthlyVol = estimatedVolatility / Math.sqrt(12);
    const var95Pct = FinancialService.round(1.65 * monthlyVol, 2);
    const var95Amount = FinancialService.round((totalValue * var95Pct) / 100, 0);

    // 5. Intelligent Advisory Recommendations
    const recommendations = [];

    // Drift recommendations
    if (drift.equity > 5) {
      const trimAmount = FinancialService.round((totalValue * drift.equity) / 100, 0);
      recommendations.push({
        type: 'rebalance',
        priority: 'high',
        title: 'Equity Exposure Above Target',
        message: `Your equity exposure is ${actualAllocation.equity}% vs target ${profile.equity}% (+${drift.equity}% overweight). Consider rebalancing approximately ₹${trimAmount.toLocaleString('en-IN')} into Debt or Gold to lock in gains and control downside volatility.`,
      });
    } else if (drift.equity < -5) {
      recommendations.push({
        type: 'rebalance',
        priority: 'medium',
        title: 'Equity Exposure Below Target',
        message: `Your equity allocation is ${actualAllocation.equity}%, which is ${Math.abs(drift.equity)}% below your ${riskProfile} target. Increasing your equity SIP allocations can help capture long-term compounding.`,
      });
    }

    if (concentrationRisks.length > 0) {
      recommendations.push({
        type: 'concentration',
        priority: 'high',
        title: 'Single-Asset Concentration Risk',
        message: `${concentrationRisks.length} holding(s) exceed 20% of your total portfolio. Diversifying across uncorrelated fund houses or asset classes will enhance risk-adjusted stability.`,
      });
    }

    if (actualAllocation.gold < 5) {
      recommendations.push({
        type: 'hedge',
        priority: 'low',
        title: 'Gold / Commodity Hedge Opportunity',
        message: 'Your portfolio holds under 5% in Gold/Hedge assets. A 5-10% allocation provides a historical cushion during equity drawdowns and currency depreciations.',
      });
    }

    // Health Verdict
    let healthRating = 'Good';
    if (diversificationScore >= 80 && concentrationRisks.length === 0 && Math.abs(drift.equity || 0) <= 5) {
      healthRating = 'Excellent';
    } else if (diversificationScore < 50 || concentrationRisks.length >= 2 || Math.abs(drift.equity || 0) > 15) {
      healthRating = 'Needs Attention';
    }

    return {
      healthRating,
      riskProfile,
      diversificationScore,
      returnSummary,
      actualAllocation,
      targetAllocation: profile,
      drift,
      riskMetrics: {
        portfolioBeta: estimatedBeta,
        annualizedVolatility: estimatedVolatility,
        sharpeRatio,
        riskFreeRate,
        valueAtRisk95: {
          percentage: var95Pct,
          estimatedLossAmount: var95Amount,
          horizon: '1 Month',
        },
      },
      concentrationRisks,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };
  }
}

module.exports = PortfolioAiService;

