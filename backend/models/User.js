const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    language: { type: String, default: 'en' },
    pomodoroWork: { type: Number, default: 25 },
    pomodoroBreak: { type: Number, default: 5 }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastStudied: { type: Date, default: null }
  },
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    quizzesCompleted: { type: Number, default: 0 },
    flashcardsReviewed: { type: Number, default: 0 },
    filesUploaded: { type: Number, default: 0 }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastStudied = this.streak.lastStudied ? new Date(this.streak.lastStudied) : null;
  if (lastStudied) {
    lastStudied.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.streak.current += 1;
    } else if (diffDays > 1) {
      this.streak.current = 1;
    }
  } else {
    this.streak.current = 1;
  }
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  this.streak.lastStudied = new Date();
};

module.exports = mongoose.model('User', userSchema);
