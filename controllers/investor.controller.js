const investorService = require("../services/investor.service");
const { sendSuccess } = require("../utils/responseHelper");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("investorController");

const createInvestor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await investorService.createInvestor({ ...req.body, user_id: userId });
    logger.info(`Investor created for user: ${userId}`);
    sendSuccess(res, result, "Investor created successfully", 201);
  } catch (err) {
    logger.error(`Create investor error: ${err.message}`);
    next(err);
  }
};

const getAllInvestors = async (req, res, next) => {
  try {
    const userId = req.user.role === 'superAdmin' ? null : req.user.id;
    const investors = await investorService.getInvestors(userId);
    sendSuccess(res, investors);
  } catch (err) {
    logger.error(`Get investors error: ${err.message}`);
    next(err);
  }
};

const getInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const investor = await investorService.getInvestorById(id);
    sendSuccess(res, investor);
  } catch (err) {
    logger.error(`Get investor error: ${err.message}`);
    next(err);
  }
};

const updateInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await investorService.updateInvestor(id, req.body);
    sendSuccess(res, result, "Investor updated successfully");
  } catch (err) {
    logger.error(`Update investor error: ${err.message}`);
    next(err);
  }
};

const deleteInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await investorService.deleteInvestor(id);
    sendSuccess(res, null, "Investor deleted successfully");
  } catch (err) {
    logger.error(`Delete investor error: ${err.message}`);
    next(err);
  }
};

const updateKYC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await investorService.updateKYC(id, req.body);
    sendSuccess(res, result, "KYC status updated successfully");
  } catch (err) {
    logger.error(`Update KYC error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  createInvestor,
  getAllInvestors,
  getInvestor,
  updateInvestor,
  deleteInvestor,
  updateKYC
};
