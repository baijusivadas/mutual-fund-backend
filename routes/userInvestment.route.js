const express = require('express');
const { getUserInvestments } = require('../controllers/userInvestment.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/user-investments', authenticate, getUserInvestments);

module.exports = router;
