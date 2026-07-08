const UserAnalytics = require('../models/UserAnalytics');
const Leaderboard = require('../models/Leaderboard');
const Category = require('../models/Category');

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function cacheKey(userId) {
  return `rec:${userId}`;
}

function getCache(key) {
  const value = cache.get(key);
  if (!value) return null;
  if (Date.now() > value.expiresAt) {
    cache.delete(key);
    return null;
  }
  return value.payload;
}

function setCache(key, payload) {
  cache.set(key, {
    payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function adaptiveDifficultyRule(averageAccuracy, difficultyPerformance) {
  const medium = difficultyPerformance.find((item) => item.difficulty === 'medium');
  const hard = difficultyPerformance.find((item) => item.difficulty === 'hard');

  if (averageAccuracy > 85) {
    if ((medium?.averageAccuracy || 0) >= 82) {
      return {
        difficulty: 'hard',
        reason: 'You consistently score high and are ready for harder sets.',
      };
    }
    return {
      difficulty: 'medium',
      reason: 'Your high accuracy suggests medium mode for balanced growth.',
    };
  }

  if (averageAccuracy < 50) {
    return {
      difficulty: 'easy',
      reason: 'Lower recent accuracy detected, recommending easier revision sets.',
    };
  }

  if ((hard?.attempts || 0) >= 5 && (hard?.averageAccuracy || 0) >= 75) {
    return {
      difficulty: 'hard',
      reason: 'Hard difficulty performance is stable. Continue advanced practice.',
    };
  }

  return {
    difficulty: 'medium',
    reason: 'Medium difficulty gives the best balance for current performance.',
  };
}

function predictNextAccuracy(recentPerformance, averageAccuracy) {
  if (!recentPerformance || recentPerformance.length < 3) {
    return Number(averageAccuracy.toFixed(2));
  }

  const recent = recentPerformance.slice(-5);
  const first = recent[0].accuracy;
  const last = recent[recent.length - 1].accuracy;
  const trend = (last - first) / Math.max(1, recent.length - 1);

  return Number(Math.max(0, Math.min(100, last + trend)).toFixed(2));
}

async function getPersonalizedRecommendations(userId, options = {}) {
  const key = cacheKey(String(userId));
  const shouldRefresh = options.refresh === true;
  const cached = shouldRefresh ? null : getCache(key);
  if (cached) return cached;

  const [analytics, leaderboard] = await Promise.all([
    UserAnalytics.findOne({ userId }).lean(),
    Leaderboard.findOne({ userId }).select('globalRank').lean(),
  ]);

  if (!analytics) {
    const categories = await Category.find().select('name').sort({ name: 1 }).limit(3).lean();
    const payload = {
      suggestedDifficulty: 'easy',
      recommendedCategories: categories.map((item) => item.name),
      practiceTopics: [],
      weakAreaQuizzes: [],
      adaptiveMessage: 'Start with easy quizzes to build a strong base.',
      performancePrediction: {
        nextQuizAccuracy: 55,
        confidence: 'low',
      },
      smartSuggestions: [
        'Take your first 3 quizzes to unlock adaptive recommendations.',
      ],
      socialHighlights: {
        globalRank: leaderboard?.globalRank || null,
        highlight: 'Start playing to appear in ranking highlights.',
      },
    };

    setCache(key, payload);
    return payload;
  }

  const recommendedDifficulty = adaptiveDifficultyRule(
    analytics.averageAccuracy || 0,
    analytics.difficultyPerformance || []
  );

  const sortedCategories = [...(analytics.categoryPerformance || [])]
    .sort((a, b) => b.averageAccuracy - a.averageAccuracy);

  const recommendedCategories = sortedCategories.slice(0, 3).map((item) => item.categoryName);
  const weakCategoryNames = [...sortedCategories]
    .reverse()
    .slice(0, 2)
    .map((item) => item.categoryName);

  const weakTopics = analytics.weakTopics || [];
  const strongTopics = analytics.strongTopics || [];

  const nextQuizAccuracy = predictNextAccuracy(
    analytics.recentPerformance || [],
    analytics.averageAccuracy || 0
  );

  const confidence = (analytics.totalQuizzes || 0) >= 15 ? 'high' : (analytics.totalQuizzes || 0) >= 6 ? 'medium' : 'low';

  const smartSuggestions = [];
  if (weakTopics.length) {
    smartSuggestions.push(`You should practice ${weakTopics[0]} first.`);
  }
  if ((analytics.averageAccuracy || 0) > 80) {
    smartSuggestions.push('You are likely ready for harder quizzes this week.');
  }
  if ((analytics.averageTimePerQuestion || 0) > 24) {
    smartSuggestions.push('Focus on speed drills to improve completion time.');
  }
  if (strongTopics.length) {
    smartSuggestions.push(`Your strongest area is ${strongTopics[0]}. Keep the momentum.`);
  }

  const payload = {
    suggestedDifficulty: recommendedDifficulty.difficulty,
    recommendedCategories,
    practiceTopics: weakTopics,
    weakAreaQuizzes: weakCategoryNames,
    adaptiveMessage: recommendedDifficulty.reason,
    performancePrediction: {
      nextQuizAccuracy,
      confidence,
    },
    smartSuggestions: smartSuggestions.slice(0, 5),
    socialHighlights: {
      globalRank: leaderboard?.globalRank || null,
      highlight: leaderboard?.globalRank
        ? `You are currently ranked #${leaderboard.globalRank} globally.`
        : 'Complete more quizzes to earn a public ranking highlight.',
    },
  };

  setCache(key, payload);
  return payload;
}

module.exports = {
  getPersonalizedRecommendations,
};
