const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
    default: null
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

chatHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
