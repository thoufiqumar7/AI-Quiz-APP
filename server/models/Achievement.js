const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0,
    },
    conditionType: {
      type: String,
      required: true,
      enum: [
        'total_quizzes',
        'streak_days',
        'high_accuracy_quizzes',
        'perfect_scores',
        'hard_quiz_wins',
        'total_xp',
      ],
    },
    conditionValue: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

achievementSchema.index({ conditionType: 1, conditionValue: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
