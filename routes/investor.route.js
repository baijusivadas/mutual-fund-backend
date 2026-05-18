const express = require("express");
const router = express.Router();
const investorController = require("../controllers/investor.controller");
const authenticate = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate");

const investorSchema = {
  full_name: { required: true, type: 'string' },
  pan: { required: true, type: 'string', pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
};

router.use(authenticate);

router.post("/investors", validate(investorSchema), investorController.createInvestor);
router.get("/investors", investorController.getAllInvestors);
router.get("/investors/:id", investorController.getInvestor);
router.put("/investors/:id", investorController.updateInvestor);
router.delete("/investors/:id", investorController.deleteInvestor);
router.put("/investors/:id/kyc", investorController.updateKYC);

module.exports = router;
