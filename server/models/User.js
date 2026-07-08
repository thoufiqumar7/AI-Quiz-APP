const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
      index: true,
    },
    rolePermissions: {
      type: [String],
      default: [],
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RefreshToken',
      },
    ],
    xpPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
    badges: {
      type: [String],
      default: [],
    },
    completedChallenges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyChallenge',
      },
    ],
    lastQuizDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

userSchema.index({ xpPoints: -1, currentLevel: -1 });
userSchema.index({ streakCount: -1, longestStreak: -1 });
userSchema.index({ createdAt: -1, isBlocked: 1 });

module.exports = mongoose.model('User', userSchema);
