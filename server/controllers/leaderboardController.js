const { getGlobalLeaderboard, getPeriodLeaderboard } = require('../services/leaderboardService');

function parsePagination(req) {
  return {
    page: req.query.page,
    limit: req.query.limit,
  };
}

async function globalLeaderboard(req, res, next) {
  try {
    const { page, limit } = parsePagination(req);
    const data = await getGlobalLeaderboard({ page, limit, currentUserId: req.user._id });
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

async function weeklyLeaderboard(req, res, next) {
  try {
    const { page, limit } = parsePagination(req);
    const data = await getPeriodLeaderboard({ days: 7, page, limit, currentUserId: req.user._id });
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

async function monthlyLeaderboard(req, res, next) {
  try {
    const { page, limit } = parsePagination(req);
    const data = await getPeriodLeaderboard({ days: 30, page, limit, currentUserId: req.user._id });
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  globalLeaderboard,
  weeklyLeaderboard,
  monthlyLeaderboard,
};
