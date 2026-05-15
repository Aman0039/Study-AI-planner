const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getChatSessions, getChatHistory, deleteChat } = require('../controllers/chatController');

router.use(protect);
router.post('/', sendMessage);
router.get('/', getChatSessions);
router.get('/:chatId', getChatHistory);
router.delete('/:chatId', deleteChat);

module.exports = router;
