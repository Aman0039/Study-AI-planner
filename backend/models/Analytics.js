const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studySessions: [{
    date: Date,
    duration: Number, // minutes
    subject: String,
    type: { type: String, enum: ['reading', 'quiz', 'flashcard', 'chat', 'pomodoro'] }
  }],
  weeklyGoal: {
    type: Number,
    default: 300 // 5 hours per week in minutes
  },
  subjectProgress: [{
    subject: String,
    timeSpent: Number, // minutes
    quizAverage: Number,
    lastStudied: Date
  }],
  achievements: [{
    title: String,
    description: String,
    icon: String,
    earnedAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
