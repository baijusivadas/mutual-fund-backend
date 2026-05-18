const AnalyticsService = require("../services/analytics.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("analyticsController");

const getPortfolioMetrics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Use the optimized service layer for all analytics processing
        const results = await AnalyticsService.getConsolidatedMetrics(userId, userRole);

        res.json(results);
    } catch (err) {
        logger.error(`Get metrics error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    getPortfolioMetrics,
};
