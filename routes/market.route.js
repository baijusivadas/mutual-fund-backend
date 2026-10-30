const express = require('express');
const { handleGetIndices } = require('../controllers/market.controller');

const router = express.Router();

router.get('/market/indices', handleGetIndices);

module.exports = router;

