const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'youtube'],
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  filePath: {
    type: String,
    default: null
  },
  youtubeUrl: {
    type: String,
    default: null
  },
  extractedText: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String
  }],
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  summary: {
    short: String,
    detailed: String,
    bullets: [String],
    keyConcepts: [String]
  },
  metadata: {
    pageCount: Number,
    wordCount: Number,
    duration: String // for YouTube videos
  }
}, { timestamps: true });

// Index for faster queries
uploadedFileSchema.index({ user: 1, createdAt: -1 });
uploadedFileSchema.index({ user: 1, subject: 1 });

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
