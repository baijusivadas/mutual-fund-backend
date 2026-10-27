const express = require('express');
const { handleChat } = require('../controllers/chat.controller');

const router = express.Router();

router.post('/chat', handleChat);
router.post('/chat/route', handleChat);

module.exports = router;
