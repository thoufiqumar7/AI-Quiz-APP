const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalScore: {
      type: Number,
      default: 0,
      index: true,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      index: true,
    },
    quizzesPlayed: {
      type: Number,
      default: 0,
      index: true,
    },
    fastestCompletion: {
      type: Number,
      default: 0,
      index: true,
    },
    weeklyRank: {
      type: Number,
      default: null,
      index: true,
    },
    monthlyRank: {
      type: Number,
      default: null,
      index: true,
    },
    globalRank: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  }
);

leaderboardSchema.index({ totalScore: -1, averageAccuracy: -1, fastestCompletion: 1, quizzesPlayed: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
