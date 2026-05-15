const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  subjects: [{
    name: String,
    hoursNeeded: Number,
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    completed: { type: Boolean, default: false }
  }],
  availableHoursPerDay: {
    type: Number,
    required: true
  },
  schedule: [{
    date: Date,
    day: String,
    sessions: [{
      subject: String,
      duration: Number, // in minutes
      topic: String,
      completed: { type: Boolean, default: false }
    }],
    totalHours: Number
  }],
  tips: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
