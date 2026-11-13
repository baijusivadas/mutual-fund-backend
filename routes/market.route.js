const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

router.get('/market/indices', marketController.getIndices);
router.get('/market/quote/:symbol', marketController.getQuote);
router.get('/market/news', marketController.getNews);

module.exports = router;

