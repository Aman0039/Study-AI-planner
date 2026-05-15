const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
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
    required: true
  },
  subject: {
    type: String,
    default: 'General'
  },
  cards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    reviewCount: { type: Number, default: 0 },
    lastReviewed: { type: Date, default: null },
    nextReview: { type: Date, default: null },
    known: { type: Boolean, default: false }
  }],
  totalCards: {
    type: Number,
    default: 0
  },
  masteredCards: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

flashcardSchema.index({ user: 1, subject: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
