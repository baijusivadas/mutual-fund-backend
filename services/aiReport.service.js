const FinancialService = require('./financial.service');
const PortfolioAiService = require('./portfolioAi.service');
const MarketService = require('./market.service');

class AiReportService {
  /**
   * Generate an Executive Portfolio Summary Report.
   */
  static async generateExecutiveSummary(portfolioData, clientName = 'Valued Investor') {
    const analysis = await PortfolioAiService.analyzePortfolio(portfolioData);
    const indices = await MarketService.getIndices();
    const nifty = indices.find((i) => i.symbol === 'NIFTY 50') || { value: 25420, changePercent: 0.56 };

    const totalVal = Number(portfolioData.totalCurrentValue) || 2187000;
    const totalInv = Number(portfolioData.totalInvested) || 1894000;
    const absReturn = FinancialService.calculateAbsoluteReturn(totalInv, totalVal);

    return {
      reportType: 'EXECUTIVE_PORTFOLIO_SUMMARY',
      title: `Executive Wealth Brief — ${clientName}`,
      generatedAt: new Date().toISOString(),
      clientName,
      keyHighlights: {
        totalNetWorth: totalVal,
        totalInvested: totalInv,
        unrealizedGain: absReturn.absoluteGain,
        gainPercentage: `${absReturn.gainPercentage}%`,
        healthScore: `${analysis.diversificationScore}/100 (${analysis.healthRating})`,
        benchmarkContext: `Nifty 50 at ${nifty.value.toLocaleString('en-IN')} (${nifty.changePercent > 0 ? '+' : ''}${nifty.changePercent}%)`,
      },
      assetAllocationSummary: analysis.actualAllocation,
      riskDiagnostics: analysis.riskMetrics,
      topRecommendations: analysis.recommendations.slice(0, 3),
      executiveCommentary: `Portfolio displays ${analysis.healthRating.toLowerCase()} resilience with an overall diversification score of ${analysis.diversificationScore}/100. Equity allocation stands at ${analysis.actualAllocation.equity}%, while debt and gold provide liquidity and inflation hedging. Value at Risk is estimated at ${analysis.riskMetrics.valueAtRisk95.percentage}% over a 30-day horizon.`,
    };
  }

  /**
   * Generate a Tax Harvesting & Year-End Capital Gains Memo.
   */
  static async generateTaxHarvestingMemo(capitalGainsData, clientName = 'Valued Investor') {
    const stcgGains = Number(capitalGainsData?.stcgTotal) || 45200;
    const ltcgGains = Number(capitalGainsData?.ltcgTotal) || 185400;

    // Indian Finance Act 2024 tax regulations
    const ltcgExemptionLimit = 125000; // ₹1.25 Lakh
    const taxableLtcg = Math.max(0, ltcgGains - ltcgExemptionLimit);
    const estimatedLtcgTax = FinancialService.round(taxableLtcg * 0.125, 0); // 12.5%
    const estimatedStcgTax = FinancialService.round(stcgGains * 0.20, 0); // 20.0%
    const totalTaxLiability = estimatedLtcgTax + estimatedStcgTax;

    const remainingExemption = Math.max(0, ltcgExemptionLimit - ltcgGains);

    const strategies = [];
    if (remainingExemption > 0) {
      strategies.push({
        action: 'HARVEST_UNREALIZED_LTCG',
        benefit: `You have ₹${remainingExemption.toLocaleString('en-IN')} in unused LTCG tax exemption before March 31st. Selling and reinvesting units with unrealized gains up to this amount will step up your cost basis with ZERO tax.`,
        urgency: 'HIGH',
      });
    }

    if (stcgGains > 50000) {
      strategies.push({
        action: 'OFFSET_WITH_SHORT_TERM_LOSSES',
        benefit: `Short-term gains are taxed at 20%. Booking unrealized losses in lagging equity or hybrid positions can offset this liability directly.`,
        urgency: 'MEDIUM',
      });
    }

    return {
      reportType: 'TAX_HARVESTING_MEMO',
      title: `Capital Gains & Tax Optimization Advisory — FY 2025-26`,
      clientName,
      generatedAt: new Date().toISOString(),
      statutoryFramework: 'Indian Finance Act 2024 (STCG: 20%, LTCG: 12.5% above ₹1.25 Lakh)',
      taxPosition: {
        shortTermCapitalGains: stcgGains,
        longTermCapitalGains: ltcgGains,
        ltcgExemptionLimit,
        taxableLtcg,
        estimatedLtcgTax,
        estimatedStcgTax,
        totalTaxLiability,
        unutilizedExemption: remainingExemption,
      },
      actionableStrategies: strategies,
    };
  }
}

module.exports = AiReportService;

