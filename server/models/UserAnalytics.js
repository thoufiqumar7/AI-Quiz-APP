const mongoose = require('mongoose');

const categoryPerformanceSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    averagePoints: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const difficultyPerformanceSchema = new mongoose.Schema(
  {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    averagePoints: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const recentPerformanceSchema = new mongoose.Schema(
  {
    completedAt: {
      type: Date,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const userAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    strongTopics: {
      type: [String],
      default: [],
    },
    weakTopics: {
      type: [String],
      default: [],
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0,
    },
    totalWrongAnswers: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0,
    },
    categoryPerformance: {
      type: [categoryPerformanceSchema],
      default: [],
    },
    difficultyPerformance: {
      type: [difficultyPerformanceSchema],
      default: [],
    },
    recentPerformance: {
      type: [recentPerformanceSchema],
      default: [],
    },
    smartInsights: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  }
);

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
