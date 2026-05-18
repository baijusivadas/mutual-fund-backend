const express = require("express");
const router = express.Router();
const masterController = require("../controllers/master.controller");
const authenticate = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Public/Authenticated read access
router.get("/fund-houses", authenticate, masterController.getFundHouses);
router.get("/mutual-funds", authenticate, masterController.getMutualFunds);
router.get("/stocks", authenticate, masterController.getStocks);

// Admin only write access
router.post("/fund-houses", authenticate, roleMiddleware(['superAdmin']), masterController.createFundHouse);
router.post("/mutual-funds", authenticate, roleMiddleware(['superAdmin']), masterController.createMutualFund);
router.post("/mutual-funds/:id/nav", authenticate, roleMiddleware(['superAdmin']), masterController.addNav);
router.post("/stock-exchanges", authenticate, roleMiddleware(['superAdmin']), masterController.createStockExchange);

module.exports = router;
