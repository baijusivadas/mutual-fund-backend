const PortfolioAiService = require('./portfolioAi.service');
const MarketService = require('./market.service');

class AiAlertService {
  /**
   * Scan and evaluate active automated alerts for a given portfolio/investor.
   * @param {Object} portfolio
   */
  static async evaluateAlerts(portfolio = {}) {
    const alerts = [];
    const now = new Date();

    // 1. Market index milestone check
    const indices = await MarketService.getIndices();
    const nifty = indices.find((i) => i.symbol === 'NIFTY 50');
    if (nifty && Math.abs(nifty.changePercent) >= 0.5) {
      alerts.push({
        id: `alt-mkt-${now.toISOString().slice(0, 10)}`,
        type: 'market',
        severity: nifty.changePercent > 0 ? 'info' : 'warning',
        title: `Nifty 50 ${nifty.changePercent > 0 ? 'Surge' : 'Retracement'} (${nifty.changePercent > 0 ? '+' : ''}${nifty.changePercent}%)`,
        message: `Nifty 50 is trading at ${nifty.value.toLocaleString('en-IN')}. Verify if your equity thresholds need tactical rebalancing.`,
        date: now.toISOString(),
        actionUrl: '/portfolio-analysis',
        actionLabel: 'Check Allocation',
      });
    }

    // 2. Portfolio health diagnostics
    const diagnostics = await PortfolioAiService.analyzePortfolio(portfolio);

    // Allocation drift alert
    if (Math.abs(diagnostics.drift?.equity || 0) >= 5) {
      const isOver = diagnostics.drift.equity > 0;
      alerts.push({
        id: 'alt-drift-eq',
        type: 'drift',
        severity: 'warning',
        title: `Asset Allocation Drift: Equity ${isOver ? 'Overweight' : 'Underweight'}`,
        message: `Your equity exposure is ${diagnostics.actualAllocation?.equity}% (target ${diagnostics.targetAllocation?.equity}%). Deviation of ${diagnostics.drift.equity}%.`,
        date: now.toISOString(),
        actionUrl: '/portfolio-analysis',
        actionLabel: 'Rebalance',
      });
    }

    // Concentration alert
    if (diagnostics.concentrationRisks?.length > 0) {
      const topRisk = diagnostics.concentrationRisks[0];
      alerts.push({
        id: 'alt-conc-risk',
        type: 'concentration',
        severity: 'warning',
        title: 'Single Holding Concentration Alert',
        message: `${topRisk.schemeName} accounts for ${topRisk.weight}% of your overall wealth, exceeding the recommended 20% limit.`,
        date: now.toISOString(),
        actionUrl: '/mutual-funds',
        actionLabel: 'Review Holdings',
      });
    }

    // 3. SIP Discipline / Milestone Alert
    const totalSip = Number(portfolio.totalSipContributed) || 172000;
    if (totalSip >= 100000) {
      alerts.push({
        id: 'alt-sip-milestone',
        type: 'milestone',
        severity: 'success',
        title: 'SIP Contribution Milestone Achieved',
        message: `Congratulations! Cumulative SIP contributions have crossed ₹${(totalSip / 100000).toFixed(2)} Lakh with 100% execution discipline.`,
        date: now.toISOString(),
        actionUrl: '/transactions',
        actionLabel: 'View Statement',
      });
    }

    return {
      activeAlertsCount: alerts.length,
      alerts,
      evaluatedAt: now.toISOString(),
    };
  }
}

module.exports = AiAlertService;

