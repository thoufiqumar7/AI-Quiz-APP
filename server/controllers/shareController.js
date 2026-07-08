const Achievement = require('../models/Achievement');
const QuizSession = require('../models/QuizSession');
const Leaderboard = require('../models/Leaderboard');
const { generateSharePayload } = require('../services/shareService');

async function generateShare(req, res, next) {
  try {
    const { type, sessionId, achievementId } = req.body;

    const user = req.user;

    let meta = {};
    if (type === 'score') {
      if (!sessionId) {
        const error = new Error('sessionId is required for score sharing.');
        error.statusCode = 400;
        throw error;
      }

      const session = await QuizSession.findOne({
        _id: sessionId,
        userId: user._id,
        status: 'completed',
      }).populate('category', 'name');

      if (!session) {
        const error = new Error('Quiz session not found for sharing.');
        error.statusCode = 404;
        throw error;
      }

      meta = {
        totalPoints: session.totalPoints,
        score: session.score,
        bonusPoints: session.bonusPoints,
        accuracy: session.accuracy,
        category: session.category?.name || 'General',
        difficulty: session.difficulty,
        timeTaken: session.timeTaken,
        rank: session.rank,
        xpPoints: user.xpPoints,
        currentLevel: user.currentLevel,
      };
    }

    if (type === 'achievement') {
      if (!achievementId) {
        const error = new Error('achievementId is required for achievement sharing.');
        error.statusCode = 400;
        throw error;
      }

      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        const error = new Error('Achievement not found.');
        error.statusCode = 404;
        throw error;
      }

      const unlocked = (user.achievements || []).some((id) => String(id) === String(achievement._id));
      if (!unlocked) {
        const error = new Error('You can only share achievements that you have unlocked.');
        error.statusCode = 403;
        throw error;
      }

      meta = {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      };
    }

    if (type === 'profile') {
      const rank = await Leaderboard.findOne({ userId: user._id }).select('globalRank').lean();

      meta = {
        currentLevel: user.currentLevel,
        xpPoints: user.xpPoints,
        streakCount: user.streakCount,
        badges: user.badges || [],
        globalRank: rank?.globalRank || null,
      };
    }

    const payload = generateSharePayload({ type, user, meta });

    res.json({ success: true, share: payload });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateShare,
};
