const Achievement = require('../models/Achievement');
const Category = require('../models/Category');
const DailyChallenge = require('../models/DailyChallenge');
const Leaderboard = require('../models/Leaderboard');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const UserAchievement = require('../models/UserAchievement');
const UserAnalytics = require('../models/UserAnalytics');
const cache = require('./cacheService');

async function getAdminDashboard() {
  const cached = cache.get('admin:dashboard');
  if (cached) return cached;

  const activeSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trendSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalQuizzes,
    totalQuestions,
    totalCategories,
    totalChallenges,
    totalAchievements,
    topCategories,
    quizTrends,
    leaderboardSummary,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBlocked: false, lastLogin: { $gte: activeSince } }),
    QuizSession.countDocuments({ status: 'completed' }),
    Question.countDocuments(),
    Category.countDocuments(),
    DailyChallenge.countDocuments(),
    Achievement.countDocuments(),
    QuizSession.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$category', attempts: { $sum: 1 }, averageAccuracy: { $avg: '$accuracy' } } },
      { $sort: { attempts: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, category: { $ifNull: ['$category.name', 'Deleted category'] }, attempts: 1, averageAccuracy: { $round: ['$averageAccuracy', 2] } } },
    ]),
    QuizSession.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: trendSince } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, quizzes: { $sum: 1 }, averageAccuracy: { $avg: '$accuracy' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', quizzes: 1, averageAccuracy: { $round: ['$averageAccuracy', 2] } } },
    ]),
    Leaderboard.find()
      .populate('userId', 'name email')
      .sort({ globalRank: 1, totalScore: -1 })
      .limit(5)
      .select('userId globalRank totalScore averageAccuracy')
      .lean(),
  ]);

  return cache.set(
    'admin:dashboard',
    {
      metrics: {
        totalUsers,
        activeUsers,
        totalQuizzes,
        totalQuestions,
        totalCategories,
        totalChallenges,
        totalAchievements,
      },
      topCategories,
      quizTrends,
      dailyActivity: quizTrends.slice(-7),
      leaderboardSummary: leaderboardSummary.map((row) => ({
        userId: row.userId?._id,
        name: row.userId?.name || 'Deleted user',
        email: row.userId?.email || '',
        rank: row.globalRank,
        totalScore: row.totalScore,
        averageAccuracy: row.averageAccuracy,
      })),
    },
    30_000
  );
}

async function deleteUserAccount(userId) {
  await Promise.all([
    User.deleteOne({ _id: userId }),
    RefreshToken.deleteMany({ userId }),
    QuizSession.deleteMany({ userId }),
    UserAnalytics.deleteMany({ userId }),
    Leaderboard.deleteMany({ userId }),
    UserAchievement.deleteMany({ userId }),
  ]);
  cache.deleteByPrefix('admin:');
}

module.exports = { getAdminDashboard, deleteUserAccount };
