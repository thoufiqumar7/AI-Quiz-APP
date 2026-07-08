const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const { applyXP } = require('./gamificationService');

const defaultAchievements = [
  {
    title: 'Quiz Beginner',
    description: 'Complete your first quiz.',
    icon: 'seedling',
    xpReward: 60,
    conditionType: 'total_quizzes',
    conditionValue: 1,
  },
  {
    title: 'Consistency Builder',
    description: 'Complete 10 quizzes.',
    icon: 'target',
    xpReward: 120,
    conditionType: 'total_quizzes',
    conditionValue: 10,
  },
  {
    title: 'Fast Learner',
    description: 'Achieve 3 high-accuracy quizzes (>= 85%).',
    icon: 'zap',
    xpReward: 150,
    conditionType: 'high_accuracy_quizzes',
    conditionValue: 3,
  },
  {
    title: 'Perfect Scorer',
    description: 'Get 2 perfect-score quizzes.',
    icon: 'star',
    xpReward: 180,
    conditionType: 'perfect_scores',
    conditionValue: 2,
  },
  {
    title: 'Streak Master',
    description: 'Reach a 7-day streak.',
    icon: 'flame',
    xpReward: 220,
    conditionType: 'streak_days',
    conditionValue: 7,
  },
  {
    title: 'Hard Mode Hero',
    description: 'Win 5 hard quizzes with strong accuracy.',
    icon: 'mountain',
    xpReward: 250,
    conditionType: 'hard_quiz_wins',
    conditionValue: 5,
  },
  {
    title: 'XP Challenger',
    description: 'Reach 2000 XP.',
    icon: 'trophy',
    xpReward: 300,
    conditionType: 'total_xp',
    conditionValue: 2000,
  },
];

async function ensureDefaultAchievements() {
  const existing = await Achievement.find().select('title').lean();
  const existingTitles = new Set(existing.map((item) => item.title));

  const missing = defaultAchievements.filter((item) => !existingTitles.has(item.title));
  if (missing.length) {
    await Achievement.insertMany(missing);
  }
}

async function statCount(conditionType, userId) {
  if (conditionType === 'total_quizzes') {
    return QuizSession.countDocuments({ userId, status: 'completed' });
  }

  if (conditionType === 'high_accuracy_quizzes') {
    return QuizSession.countDocuments({ userId, status: 'completed', accuracy: { $gte: 85 } });
  }

  if (conditionType === 'perfect_scores') {
    return QuizSession.countDocuments({ userId, status: 'completed', wrongAnswers: 0, questionCount: { $gt: 0 } });
  }

  if (conditionType === 'hard_quiz_wins') {
    return QuizSession.countDocuments({
      userId,
      status: 'completed',
      difficulty: 'hard',
      accuracy: { $gte: 70 },
    });
  }

  return 0;
}

async function unlockEligibleAchievements(userId) {
  await ensureDefaultAchievements();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const allAchievements = await Achievement.find().lean();
  const unlockedRows = await UserAchievement.find({ userId }).select('achievementId').lean();
  const unlockedIds = new Set(unlockedRows.map((item) => String(item.achievementId)));

  const newUnlocked = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(String(achievement._id))) continue;

    let met = false;

    if (achievement.conditionType === 'streak_days') {
      met = (user.streakCount || 0) >= achievement.conditionValue;
    } else if (achievement.conditionType === 'total_xp') {
      met = (user.xpPoints || 0) >= achievement.conditionValue;
    } else {
      const count = await statCount(achievement.conditionType, userId);
      met = count >= achievement.conditionValue;
    }

    if (!met) continue;

    await UserAchievement.create({
      userId,
      achievementId: achievement._id,
      unlockedAt: new Date(),
    });

    newUnlocked.push(achievement);
    unlockedIds.add(String(achievement._id));
  }

  if (newUnlocked.length) {
    const xpSum = newUnlocked.reduce((sum, item) => sum + (item.xpReward || 0), 0);

    const freshUser = await User.findById(userId);
    if (!Array.isArray(freshUser.achievements)) freshUser.achievements = [];
    if (!Array.isArray(freshUser.badges)) freshUser.badges = [];
    const currentAchievementIds = new Set((freshUser.achievements || []).map((id) => String(id)));
    newUnlocked.forEach((achievement) => {
      if (!currentAchievementIds.has(String(achievement._id))) {
        freshUser.achievements.push(achievement._id);
      }

      if (!freshUser.badges.includes(achievement.title)) {
        freshUser.badges.push(achievement.title);
      }
    });
    await freshUser.save();

    if (xpSum > 0) {
      await applyXP(userId, xpSum);
    }
  }

  return {
    unlockedCount: newUnlocked.length,
    unlocked: newUnlocked.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      xpReward: item.xpReward,
    })),
  };
}

async function getUserAchievements(userId) {
  await ensureDefaultAchievements();

  const allAchievements = await Achievement.find().sort({ createdAt: 1 }).lean();
  const unlockedRows = await UserAchievement.find({ userId }).select('achievementId unlockedAt').lean();

  const unlockedMap = new Map(unlockedRows.map((row) => [String(row.achievementId), row.unlockedAt]));

  return allAchievements.map((achievement) => ({
    id: achievement._id,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    xpReward: achievement.xpReward,
    conditionType: achievement.conditionType,
    conditionValue: achievement.conditionValue,
    unlocked: unlockedMap.has(String(achievement._id)),
    unlockedAt: unlockedMap.get(String(achievement._id)) || null,
  }));
}

module.exports = {
  ensureDefaultAchievements,
  unlockEligibleAchievements,
  getUserAchievements,
};
