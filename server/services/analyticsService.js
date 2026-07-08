const UserAnalytics = require('../models/UserAnalytics');
const QuizSession = require('../models/QuizSession');

function round(value, digits = 2) {
  return Number((value || 0).toFixed(digits));
}

function generateInsights({ totalQuizzes, avgAccuracy, avgTimePerQuestion, difficultyPerformance, strongTopics, weakTopics, recentPerformance }) {
  const insights = [];

  if (totalQuizzes === 0) {
    insights.push('Start with a few quizzes to unlock personalized insights.');
    return insights;
  }

  if (avgAccuracy >= 85) {
    insights.push('Excellent consistency. You maintain high overall accuracy.');
  } else if (avgAccuracy < 60) {
    insights.push('Focus on fundamentals to improve your overall accuracy baseline.');
  }

  const medium = difficultyPerformance.find((item) => item.difficulty === 'medium');
  const hard = difficultyPerformance.find((item) => item.difficulty === 'hard');
  if (medium && hard && hard.averageAccuracy >= medium.averageAccuracy + 8) {
    insights.push('You improve faster in hard quizzes than medium ones. Keep challenging yourself.');
  }

  if (avgTimePerQuestion > 25) {
    insights.push('Try improving pacing. Your average response time is relatively high.');
  } else if (avgTimePerQuestion <= 15) {
    insights.push('Great speed. You are solving questions quickly without major slowdowns.');
  }

  if (weakTopics.length) {
    insights.push(`Practice more in: ${weakTopics.slice(0, 2).join(', ')}.`);
  }

  if (strongTopics.length) {
    insights.push(`Your strongest topics are: ${strongTopics.slice(0, 2).join(', ')}.`);
  }

  if (recentPerformance.length >= 5) {
    const first = recentPerformance[0];
    const last = recentPerformance[recentPerformance.length - 1];
    const delta = last.accuracy - first.accuracy;
    if (delta >= 10) {
      insights.push(`Your accuracy improved by ${round(delta, 1)}% across recent quizzes.`);
    } else if (delta <= -10) {
      insights.push('Recent performance dropped. Revisit weak topics and retry medium sets.');
    }
  }

  return insights.slice(0, 6);
}

async function refreshUserAnalytics(userId) {
  const sessions = await QuizSession.find({ userId, status: 'completed' })
    .populate('category', 'name')
    .select('accuracy totalPoints correctAnswers wrongAnswers answerDetails difficulty category timeTaken averageTimePerQuestion completedAt')
    .sort({ completedAt: 1 })
    .lean();

  if (!sessions.length) {
    const empty = {
      strongTopics: [],
      weakTopics: [],
      averageAccuracy: 0,
      totalQuizzes: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      totalScore: 0,
      averageTimePerQuestion: 0,
      categoryPerformance: [],
      difficultyPerformance: [
        { difficulty: 'easy', attempts: 0, averageAccuracy: 0, averagePoints: 0 },
        { difficulty: 'medium', attempts: 0, averageAccuracy: 0, averagePoints: 0 },
        { difficulty: 'hard', attempts: 0, averageAccuracy: 0, averagePoints: 0 },
      ],
      recentPerformance: [],
      smartInsights: ['Start with a few quizzes to unlock personalized insights.'],
    };

    await UserAnalytics.findOneAndUpdate(
      { userId },
      { $set: empty },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    );
    return empty;
  }

  const totalQuizzes = sessions.length;
  const totalCorrectAnswers = sessions.reduce((sum, item) => sum + (item.correctAnswers || 0), 0);
  const totalWrongAnswers = sessions.reduce((sum, item) => sum + (item.wrongAnswers || 0), 0);
  const totalScore = sessions.reduce((sum, item) => sum + (item.totalPoints || 0), 0);
  const averageAccuracy = round(
    sessions.reduce((sum, item) => sum + (item.accuracy || 0), 0) / Math.max(1, totalQuizzes)
  );

  const averageTimePerQuestion = round(
    sessions.reduce((sum, item) => sum + (item.averageTimePerQuestion || 0), 0) / Math.max(1, totalQuizzes)
  );

  const categoryBuckets = new Map();
  sessions.forEach((session) => {
    const key = String(session.category?._id || 'unknown');
    const label = session.category?.name || 'Unknown';
    const bucket = categoryBuckets.get(key) || {
      categoryId: session.category?._id,
      categoryName: label,
      attempts: 0,
      sumAccuracy: 0,
      sumPoints: 0,
    };
    bucket.attempts += 1;
    bucket.sumAccuracy += session.accuracy || 0;
    bucket.sumPoints += session.totalPoints || 0;
    categoryBuckets.set(key, bucket);
  });

  const categoryPerformance = [...categoryBuckets.values()]
    .map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      attempts: item.attempts,
      averageAccuracy: round(item.sumAccuracy / Math.max(1, item.attempts)),
      averagePoints: round(item.sumPoints / Math.max(1, item.attempts)),
    }))
    .sort((a, b) => b.averageAccuracy - a.averageAccuracy);

  const difficultyBase = ['easy', 'medium', 'hard'].map((difficulty) => ({
    difficulty,
    attempts: 0,
    sumAccuracy: 0,
    sumPoints: 0,
  }));

  sessions.forEach((session) => {
    const target = difficultyBase.find((item) => item.difficulty === session.difficulty);
    if (!target) return;
    target.attempts += 1;
    target.sumAccuracy += session.accuracy || 0;
    target.sumPoints += session.totalPoints || 0;
  });

  const difficultyPerformance = difficultyBase.map((item) => ({
    difficulty: item.difficulty,
    attempts: item.attempts,
    averageAccuracy: item.attempts ? round(item.sumAccuracy / item.attempts) : 0,
    averagePoints: item.attempts ? round(item.sumPoints / item.attempts) : 0,
  }));

  const topicMap = new Map();
  sessions.forEach((session) => {
    (session.answerDetails || []).forEach((detail) => {
      const topic = detail.topic || 'General';
      const bucket = topicMap.get(topic) || { correct: 0, total: 0 };
      bucket.total += 1;
      if (detail.isCorrect) bucket.correct += 1;
      topicMap.set(topic, bucket);
    });
  });

  const topicStats = [...topicMap.entries()]
    .map(([topic, stat]) => ({
      topic,
      accuracy: stat.total ? (stat.correct / stat.total) * 100 : 0,
      attempts: stat.total,
    }))
    .filter((item) => item.attempts >= 2)
    .sort((a, b) => b.accuracy - a.accuracy);

  const strongTopics = topicStats
    .filter((item) => item.accuracy >= 70)
    .slice(0, 5)
    .map((item) => item.topic);

  const weakTopics = [...topicStats]
    .reverse()
    .filter((item) => item.accuracy <= 55)
    .slice(0, 5)
    .map((item) => item.topic);

  const recentPerformance = sessions
    .slice(-12)
    .map((session) => ({
      completedAt: session.completedAt,
      categoryName: session.category?.name || 'Unknown',
      difficulty: session.difficulty,
      accuracy: session.accuracy,
      totalPoints: session.totalPoints,
      timeTaken: session.timeTaken,
    }));

  const smartInsights = generateInsights({
    totalQuizzes,
    avgAccuracy: averageAccuracy,
    avgTimePerQuestion: averageTimePerQuestion,
    difficultyPerformance,
    strongTopics,
    weakTopics,
    recentPerformance,
  });

  const payload = {
    strongTopics,
    weakTopics,
    averageAccuracy,
    totalQuizzes,
    totalCorrectAnswers,
    totalWrongAnswers,
    totalScore,
    averageTimePerQuestion,
    categoryPerformance,
    difficultyPerformance,
    recentPerformance,
    smartInsights,
  };

  await UserAnalytics.findOneAndUpdate(
    { userId },
    { $set: payload },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );

  return payload;
}

async function getOrRefreshAnalytics(userId) {
  let analytics = await UserAnalytics.findOne({ userId }).lean();
  if (!analytics) {
    analytics = await refreshUserAnalytics(userId);
  }
  return analytics;
}

module.exports = {
  refreshUserAnalytics,
  getOrRefreshAnalytics,
};
