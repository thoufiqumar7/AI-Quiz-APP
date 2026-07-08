const QuizSession = require('../models/QuizSession');
const { getOrRefreshAnalytics, refreshUserAnalytics } = require('../services/analyticsService');

function safeNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

async function dashboardAnalytics(req, res, next) {
  try {
    const analytics = await getOrRefreshAnalytics(req.user._id);

    const categoryPerformance = analytics.categoryPerformance || [];
    const bestCategory = categoryPerformance[0]?.categoryName || 'N/A';
    const weakCategory = categoryPerformance.length
      ? [...categoryPerformance].sort((a, b) => a.averageAccuracy - b.averageAccuracy)[0]?.categoryName || 'N/A'
      : 'N/A';

    res.json({
      success: true,
      dashboard: {
        totalQuizzes: analytics.totalQuizzes || 0,
        averageAccuracy: safeNumber(analytics.averageAccuracy),
        totalScore: safeNumber(analytics.totalScore),
        totalCorrectAnswers: analytics.totalCorrectAnswers || 0,
        totalWrongAnswers: analytics.totalWrongAnswers || 0,
        averageTimePerQuestion: safeNumber(analytics.averageTimePerQuestion),
        bestCategory,
        weakCategory,
        smartInsights: analytics.smartInsights || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

async function performanceAnalytics(req, res, next) {
  try {
    const analytics = await getOrRefreshAnalytics(req.user._id);

    res.json({
      success: true,
      performance: {
        categoryPerformance: analytics.categoryPerformance || [],
        difficultyPerformance: analytics.difficultyPerformance || [],
        recentPerformance: analytics.recentPerformance || [],
        averageAccuracy: safeNumber(analytics.averageAccuracy),
        averageTimePerQuestion: safeNumber(analytics.averageTimePerQuestion),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function historyAnalytics(req, res, next) {
  try {
    const sessions = await QuizSession.find({ userId: req.user._id, status: 'completed' })
      .populate('category', 'name')
      .select('difficulty accuracy totalPoints timeTaken completedAt questionCount category')
      .sort({ completedAt: -1 })
      .limit(100)
      .lean();

    const history = sessions.map((session) => ({
      id: session._id,
      category: session.category?.name || 'Unknown',
      difficulty: session.difficulty,
      accuracy: session.accuracy,
      totalPoints: session.totalPoints,
      timeTaken: session.timeTaken,
      questionCount: session.questionCount,
      completedAt: session.completedAt,
    }));

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
}

async function topicAnalytics(req, res, next) {
  try {
    const forceRefresh = req.query.refresh === true || req.query.refresh === 'true';
    const analytics = forceRefresh
      ? await refreshUserAnalytics(req.user._id)
      : await getOrRefreshAnalytics(req.user._id);

    res.json({
      success: true,
      topics: {
        strongTopics: analytics.strongTopics || [],
        weakTopics: analytics.weakTopics || [],
        smartInsights: analytics.smartInsights || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboardAnalytics,
  performanceAnalytics,
  historyAnalytics,
  topicAnalytics,
};
