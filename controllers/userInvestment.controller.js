const { user_investment_mappings, purchases, redemptions } = require("../models");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("userInvestmentController");

const getUserInvestments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isSuperAdmin = req.user.role === "superAdmin";

    // 1. Fetch user mappings
    let mappings = [];
    if (isSuperAdmin) {
      mappings = await user_investment_mappings.findAll();
    } else {
      mappings = await user_investment_mappings.findAll({
        where: { user_id: userId }
      });
    }

    // 2. Extract mapped investor names for mutual funds
    const mappedInvestorNames = mappings
      .filter((m) => m.asset_type === "mutual_funds" && m.investor_name)
      .map((m) => m.investor_name);

    // 3. Fetch purchases and redemptions based on mappings
    let userPurchases = [];
    let userRedemptions = [];

    if (isSuperAdmin) {
      userPurchases = await purchases.findAll({ order: [['date', 'DESC']] });
      userRedemptions = await redemptions.findAll({ order: [['date', 'DESC']] });
    } else if (mappedInvestorNames.length > 0) {
      userPurchases = await purchases.findAll({
        where: { investor_name: mappedInvestorNames },
        order: [['date', 'DESC']]
      });
      userRedemptions = await redemptions.findAll({
        where: { investor_name: mappedInvestorNames },
        order: [['date', 'DESC']]
      });
    }

    res.json({
      mappings,
      purchases: userPurchases,
      redemptions: userRedemptions,
      mappedInvestorNames
    });
  } catch (err) {
    logger.error(`Get user investments error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getUserInvestments
};
