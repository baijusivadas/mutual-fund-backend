const masterService = require("../services/master.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("masterController");

// --- Mutual Funds ---

const createFundHouse = async (req, res, next) => {
  try {
    const result = await masterService.createFundHouse(req.body);
    res.status(201).json(result);
  } catch (err) {
    logger.error(`Create fund house error: ${err.message}`);
    next(err);
  }
};

const getFundHouses = async (req, res, next) => {
  try {
    const result = await masterService.getFundHouses();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const createMutualFund = async (req, res, next) => {
  try {
    const result = await masterService.createMutualFund(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getMutualFunds = async (req, res, next) => {
  try {
    const funds = await masterService.getMutualFunds(req.query);
    res.json(funds);
  } catch (err) {
    next(err);
  }
};

const addNav = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await masterService.addNavHistory(id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// --- Stocks ---

const createStockExchange = async (req, res, next) => {
  try {
    const result = await masterService.createStockExchange(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getStocks = async (req, res, next) => {
  try {
    const result = await masterService.getStocks(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFundHouse,
  getFundHouses,
  createMutualFund,
  getMutualFunds,
  addNav,
  createStockExchange,
  getStocks
};
