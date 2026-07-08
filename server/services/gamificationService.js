const User = require('../models/User');

const LEVEL_XP_TABLE = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400];

function xpForLevel(level) {
  if (level <= LEVEL_XP_TABLE.length) {
    return LEVEL_XP_TABLE[level - 1];
  }
  const n = level - 1;
  return Math.floor(n * n * 85 + n * 115);
}

function levelFromXP(xpPoints) {
  let level = 1;
  while (xpPoints >= xpForLevel(level + 1)) {
    level += 1;
    if (level > 250) break;
  }
  return level;
}

function levelProgress(xpPoints, currentLevel) {
  const levelStart = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const inLevel = Math.max(0, xpPoints - levelStart);
  const levelRange = Math.max(1, nextLevelXP - levelStart);
  const progressPercent = Number(((inLevel / levelRange) * 100).toFixed(2));

  return {
    nextLevelXP,
    currentLevelXPStart: levelStart,
    inLevelXP: inLevel,
    requiredXP: levelRange,
    progressPercent,
  };
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function diffInDays(a, b) {
  const left = startOfDay(a).getTime();
  const right = startOfDay(b).getTime();
  return Math.round((left - right) / (24 * 60 * 60 * 1000));
}

function calculateQuizXP({ session, scoring, nextStreak }) {
  const baseXP = Math.max(20, scoring.totalPoints);
  const bonuses = {
    highAccuracy: scoring.accuracy >= 90 ? 30 : scoring.accuracy >= 80 ? 15 : 0,
    fastCompletion:
      session.questionCount && session.timeTaken <= session.questionCount * 18
        ? 25
        : session.questionCount && session.timeTaken <= session.questionCount * 24
          ? 10
          : 0,
    perfectScore: scoring.wrongAnswers === 0 ? 25 : 0,
    streak: nextStreak >= 7 ? 25 : nextStreak >= 3 ? 10 : 0,
    hardMode: session.difficulty === 'hard' && scoring.accuracy >= 70 ? 20 : 0,
  };

  const totalBonusXP = Object.values(bonuses).reduce((sum, value) => sum + value, 0);
  const totalXP = baseXP + totalBonusXP;

  return {
    baseXP,
    totalBonusXP,
    totalXP,
    bonusBreakdown: bonuses,
  };
}

async function applyXP(userId, xpToAdd) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for XP update.');
  }

  const nextXP = Math.max(0, (user.xpPoints || 0) + xpToAdd);
  const nextLevel = levelFromXP(nextXP);

  user.xpPoints = nextXP;
  user.currentLevel = nextLevel;
  await user.save();

  return {
    xpPoints: user.xpPoints,
    currentLevel: user.currentLevel,
    progress: levelProgress(user.xpPoints, user.currentLevel),
  };
}

async function applyQuizGamification({ userId, session, scoring }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for gamification.');
  }

  const now = session.completedAt || new Date();
  const previousDate = user.lastQuizDate;

  let streakCount = 1;
  if (previousDate) {
    const diff = diffInDays(now, previousDate);
    if (diff === 0) {
      streakCount = Math.max(1, user.streakCount || 0);
    } else if (diff === 1) {
      streakCount = (user.streakCount || 0) + 1;
    } else {
      streakCount = 1;
    }
  }

  const longestStreak = Math.max(user.longestStreak || 0, streakCount);
  const xpEarned = calculateQuizXP({ session, scoring, nextStreak: streakCount });

  const nextXP = Math.max(0, (user.xpPoints || 0) + xpEarned.totalXP);
  const nextLevel = levelFromXP(nextXP);

  user.streakCount = streakCount;
  user.longestStreak = longestStreak;
  user.lastQuizDate = now;
  user.xpPoints = nextXP;
  user.currentLevel = nextLevel;

  if (!Array.isArray(user.badges)) user.badges = [];
  if (streakCount >= 7 && !user.badges.includes('7-Day Streak')) {
    user.badges.push('7-Day Streak');
  }
  if (scoring.accuracy >= 95 && !user.badges.includes('Accuracy Master')) {
    user.badges.push('Accuracy Master');
  }
  if (session.difficulty === 'hard' && scoring.accuracy >= 80 && !user.badges.includes('Hard Mode Champion')) {
    user.badges.push('Hard Mode Champion');
  }

  await user.save();

  return {
    xp: {
      earned: xpEarned,
      totalXP: user.xpPoints,
      currentLevel: user.currentLevel,
      progress: levelProgress(user.xpPoints, user.currentLevel),
    },
    streak: {
      streakCount: user.streakCount,
      longestStreak: user.longestStreak,
      lastQuizDate: user.lastQuizDate,
    },
    badges: user.badges,
  };
}

module.exports = {
  xpForLevel,
  levelFromXP,
  levelProgress,
  applyXP,
  applyQuizGamification,
};
