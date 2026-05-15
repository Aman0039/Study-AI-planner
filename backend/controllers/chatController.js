const ChatHistory = require('../models/ChatHistory');
const UploadedFile = require('../models/UploadedFile');
const { chatWithContext } = require('../utils/gemini');

/**
 * @route   POST /api/chat
 * @desc    Send a chat message
 */
const sendMessage = async (req, res) => {
  try {
    const { message, chatId, fileId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

    let chat;
    let context = '';

    // Load file context
    if (fileId) {
      const file = await UploadedFile.findOne({ _id: fileId, user: req.user.id });
      if (file) context = file.extractedText;
    }

    // Load or create chat session
    if (chatId) {
      chat = await ChatHistory.findOne({ _id: chatId, user: req.user.id });
    }

    if (!chat) {
      chat = await ChatHistory.create({
        user: req.user.id,
        sourceFile: fileId || null,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Generate AI response
    const aiResponse = await chatWithContext(
      chat.messages.slice(-10),
      context,
      message
    );

    // Add AI response
    chat.messages.push({ role: 'assistant', content: aiResponse });
    await chat.save();

    res.json({
      chatId: chat._id,
      message: { role: 'assistant', content: aiResponse },
      title: chat.title
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
};

/**
 * @route   GET /api/chat
 * @desc    Get all chat sessions
 */
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ user: req.user.id, isActive: true })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat sessions.' });
  }
};

/**
 * @route   GET /api/chat/:chatId
 * @desc    Get chat history
 */
const getChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.chatId, user: req.user.id });
    if (!chat) return res.status(404).json({ error: 'Chat session not found.' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

/**
 * @route   DELETE /api/chat/:chatId
 * @desc    Delete a chat session
 */
const deleteChat = async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ _id: req.params.chatId, user: req.user.id });
    res.json({ message: 'Chat deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat.' });
  }
};

module.exports = { sendMessage, getChatSessions, getChatHistory, deleteChat };
