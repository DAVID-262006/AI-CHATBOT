import { PrismaClient } from '@prisma/client';
import { openaiService } from '../services/openaiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const chatController = {
  // Send message and get response
  sendMessage: asyncHandler(async (req, res) => {
    const { chatId, message, userId } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      const error = new Error('Message cannot be empty');
      error.statusCode = 400;
      throw error;
    }

    if (!chatId) {
      const error = new Error('Chat ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Get or create user
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user && !userId) {
      user = await prisma.user.create({
        data: {
          email: `anonymous-${Date.now()}@local`,
        },
      });
    }

    // Get chat or create new one
    let chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!chat) {
      // Create new chat if doesn't exist
      chat = await prisma.chat.create({
        data: {
          userId: user.id,
          title: message.substring(0, 50),
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message.trim(),
      },
    });

    // Prepare messages for OpenAI (include conversation history)
    const conversationHistory = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    const openaiMessages = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Get response from OpenAI
    const aiResponse = await openaiService.generateResponse(openaiMessages);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: aiResponse.content,
      },
    });

    // Get updated chat with all messages
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    res.status(200).json({
      success: true,
      data: {
        chat: updatedChat,
        userMessage,
        assistantMessage,
      },
    });
  }),

  // Get chat history
  getChat: asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
      const error = new Error('Chat ID is required');
      error.statusCode = 400;
      throw error;
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!chat) {
      const error = new Error('Chat not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  }),

  // Create new chat
  createChat: asyncHandler(async (req, res) => {
    const { userId } = req.body;

    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.user.create({
        data: {
          email: `anonymous-${Date.now()}@local`,
        },
      });
    }

    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: 'New Chat',
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    res.status(201).json({
      success: true,
      data: chat,
    });
  }),
};
