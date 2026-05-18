const { 
  FundHouse, MutualFund, NavHistory, 
  StockExchange, StockSector, Stock, StockPrice, 
  sequelize 
} = require("../models");
const crypto = require("crypto");

// --- Mutual Funds ---

const createFundHouse = async (data) => {
  return await FundHouse.create({ ...data, id: crypto.randomUUID() });
};

const getFundHouses = async () => {
  return await FundHouse.findAll({ include: [MutualFund] });
};

const createMutualFund = async (data) => {
  return await MutualFund.create({ ...data, id: crypto.randomUUID() });
};

const getMutualFunds = async (filters = {}) => {
  return await MutualFund.findAll({
    where: filters,
    include: [FundHouse]
  });
};

const addNavHistory = async (fundId, navData) => {
  return await NavHistory.create({
    ...navData,
    mutual_fund_id: fundId,
    id: crypto.randomUUID()
  });
};

const getNavHistory = async (fundId) => {
  return await NavHistory.findAll({
    where: { mutual_fund_id: fundId },
    order: [['nav_date', 'DESC']]
  });
};

// --- Stocks ---

const createStockExchange = async (data) => {
  return await StockExchange.create({ ...data, id: crypto.randomUUID() });
};

const getStockExchanges = async () => {
  return await StockExchange.findAll();
};

const createStock = async (data) => {
  return await Stock.create({ ...data, id: crypto.randomUUID() });
};

const getStocks = async (filters = {}) => {
  return await Stock.findAll({
    where: filters,
    include: [StockSector]
  });
};

const addStockPrice = async (stockId, priceData) => {
  return await StockPrice.create({
    ...priceData,
    stock_id: stockId,
    id: crypto.randomUUID()
  });
};

module.exports = {
  createFundHouse,
  getFundHouses,
  createMutualFund,
  getMutualFunds,
  addNavHistory,
  getNavHistory,
  createStockExchange,
  getStockExchanges,
  createStock,
  getStocks,
  addStockPrice
};
