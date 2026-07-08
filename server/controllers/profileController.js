const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const Leaderboard = require('../models/Leaderboard');
const { levelProgress } = require('../services/gamificationService');
const { getUserAchievements } = require('../services/achievementService');

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function buildMotivationMessage(user) {
  if ((user.streakCount || 0) >= 7) {
    return 'Amazing streak. Keep the momentum going today.';
  }
  if ((user.streakCount || 0) >= 3) {
    return 'Great consistency. You are building a strong learning habit.';
  }
  if ((user.currentLevel || 1) >= 5) {
    return 'Your level is climbing fast. Take on a harder challenge.';
  }
  return 'Take a quiz today to start building your streak.';
}

function buildSmartReminder(user) {
  if (!user.lastQuizDate) {
    return 'Set your first daily habit: attempt one quiz today.';
  }

  const now = new Date();
  const last = startOfDay(user.lastQuizDate);
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays >= 2) {
    return 'Your streak is at risk. Complete a quiz today to restart momentum.';
  }
  if (diffDays === 1) {
    return 'You are one quiz away from extending your streak today.';
  }
  return 'Great job staying active today. Try a medium or hard challenge next.';
}

async function gamificationProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('completedChallenges', 'title activeDate rewardXP')
      .lean();

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const [achievements, leaderboard] = await Promise.all([
      getUserAchievements(req.user._id),
      Leaderboard.findOne({ userId: req.user._id }).select('globalRank').lean(),
    ]);

    const progress = levelProgress(user.xpPoints || 0, user.currentLevel || 1);

    const weekStart = startOfDay(new Date());
    weekStart.setDate(weekStart.getDate() - 6);

    const weeklyQuizCount = await QuizSession.countDocuments({
      userId: req.user._id,
      status: 'completed',
      completedAt: { $gte: weekStart },
    });

    const weeklyGoalTarget = 7;

    res.json({
      success: true,
      profile: {
        xpPoints: user.xpPoints || 0,
        currentLevel: user.currentLevel || 1,
        levelProgress: progress,
        streakCount: user.streakCount || 0,
        longestStreak: user.longestStreak || 0,
        badges: user.badges || [],
        globalRank: leaderboard?.globalRank || null,
        achievementsUnlocked: achievements.filter((item) => item.unlocked).length,
        achievementsTotal: achievements.length,
        completedChallenges: (user.completedChallenges || []).map((challenge) => ({
          id: challenge._id,
          title: challenge.title,
          rewardXP: challenge.rewardXP,
          activeDate: challenge.activeDate,
        })),
        weeklyGoal: {
          target: weeklyGoalTarget,
          completed: weeklyQuizCount,
          remaining: Math.max(0, weeklyGoalTarget - weeklyQuizCount),
          completedPercent: Number(((Math.min(weeklyQuizCount, weeklyGoalTarget) / weeklyGoalTarget) * 100).toFixed(2)),
        },
        lastQuizDate: user.lastQuizDate || null,
        motivationMessage: buildMotivationMessage(user),
        smartReminder: buildSmartReminder(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  gamificationProfile,
};
