import express from 'express';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/v1/chat - Send a message
router.post('/chat', chatController.sendMessage);

// GET /api/v1/chat/:chatId - Get chat history
router.get('/chat/:chatId', chatController.getChat);

// POST /api/v1/chat/new - Create new chat
router.post('/chat/new', chatController.createChat);

export default router;
