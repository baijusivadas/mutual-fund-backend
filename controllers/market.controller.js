const MarketService = require('../services/market.service');
const { sendSuccess } = require('../utils/responseHelper');

const getIndices = async (req, res) => {
  const data = await MarketService.getIndices();
  return res.json({
    status: 'success',
    success: true,
    data,
    indices: data,
    message: 'Market indices retrieved successfully',
  });
};

const getQuote = async (req, res) => {
  const { symbol } = req.params;
  const quote = await MarketService.getQuote(symbol);
  return sendSuccess(res, quote, `Quote for ${symbol} retrieved successfully`);
};

const getNews = async (req, res) => {
  const news = await MarketService.getNews();
  return sendSuccess(res, news, 'Market news retrieved successfully');
};

module.exports = {
  getIndices,
  getQuote,
  getNews,
};
