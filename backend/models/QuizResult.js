const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
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
  quizType: {
    type: String,
    enum: ['mcq', 'trueFalse', 'fillBlanks', 'mixed'],
    default: 'mcq'
  },
  questions: [{
    question: String,
    type: { type: String, enum: ['mcq', 'trueFalse', 'fillBlanks'] },
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    explanation: String
  }],
  score: {
    obtained: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

quizResultSchema.index({ user: 1, createdAt: -1 });
quizResultSchema.index({ user: 1, subject: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
