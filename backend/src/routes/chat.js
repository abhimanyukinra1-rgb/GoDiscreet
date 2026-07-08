const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const messageSchema = Joi.object({
  message_text: Joi.string(),
  message_type: Joi.string().valid('TEXT', 'IMAGE', 'VIDEO', 'VOICE')
});

router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/:conversationId/messages', authMiddleware, chatController.getMessages);
router.post('/:conversationId/message', authMiddleware, validate(messageSchema), chatController.sendMessage);
router.post('/:conversationId/unlock', authMiddleware, chatController.unlockChat);
router.post('/:conversationId/block', authMiddleware, chatController.blockUser);
router.post('/:conversationId/unblock', authMiddleware, chatController.unblockUser);

module.exports = router;
