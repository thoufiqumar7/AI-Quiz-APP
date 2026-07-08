const Leaderboard = require('../models/Leaderboard');
const QuizSession = require('../models/QuizSession');

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function clearCache() {
  cache.clear();
}

async function updateUserLeaderboard(userId) {
  const sessions = await QuizSession.find({ userId, status: 'completed' })
    .select('totalPoints accuracy timeTaken')
    .lean();

  const quizzesPlayed = sessions.length;
  const totalScore = sessions.reduce((sum, item) => sum + (item.totalPoints || 0), 0);
  const averageAccuracy = quizzesPlayed
    ? Number((sessions.reduce((sum, item) => sum + (item.accuracy || 0), 0) / quizzesPlayed).toFixed(2))
    : 0;
  const fastestCompletion = quizzesPlayed
    ? sessions.reduce((min, item) => {
        if (!item.timeTaken) return min;
        if (!min) return item.timeTaken;
        return item.timeTaken < min ? item.timeTaken : min;
      }, 0)
    : 0;

  await Leaderboard.findOneAndUpdate(
    { userId },
    {
      $set: {
        totalScore,
        averageAccuracy,
        quizzesPlayed,
        fastestCompletion,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  await recomputeRanks();
  clearCache();
}

function rankSort(a, b) {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (b.averageAccuracy !== a.averageAccuracy) return b.averageAccuracy - a.averageAccuracy;
  const aFast = a.fastestCompletion || Number.MAX_SAFE_INTEGER;
  const bFast = b.fastestCompletion || Number.MAX_SAFE_INTEGER;
  if (aFast !== bFast) return aFast - bFast;
  return b.quizzesPlayed - a.quizzesPlayed;
}

function periodSort(a, b) {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.averageAccuracy !== a.averageAccuracy) return b.averageAccuracy - a.averageAccuracy;
  const aFast = a.fastestCompletion || Number.MAX_SAFE_INTEGER;
  const bFast = b.fastestCompletion || Number.MAX_SAFE_INTEGER;
  if (aFast !== bFast) return aFast - bFast;
  return b.quizzesPlayed - a.quizzesPlayed;
}

async function recomputeRanks() {
  const docs = await Leaderboard.find().select('userId totalScore averageAccuracy fastestCompletion quizzesPlayed').lean();
  docs.sort(rankSort);

  const weeklyMap = await computePeriodRankMap(7);
  const monthlyMap = await computePeriodRankMap(30);

  const bulk = docs.map((doc, index) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: {
        $set: {
          globalRank: index + 1,
          weeklyRank: weeklyMap.get(String(doc.userId)) || null,
          monthlyRank: monthlyMap.get(String(doc.userId)) || null,
        },
      },
    },
  }));

  if (bulk.length) {
    await Leaderboard.bulkWrite(bulk, { ordered: false });
  }
}

async function computePeriodRankMap(days) {
  const start = new Date();
  start.setDate(start.getDate() - days);

  const rows = await QuizSession.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: start },
      },
    },
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$totalPoints' },
        averageAccuracy: { $avg: '$accuracy' },
        quizzesPlayed: { $sum: 1 },
        fastestCompletion: { $min: '$timeTaken' },
      },
    },
  ]);

  rows.sort(periodSort);
  const map = new Map();
  rows.forEach((row, index) => {
    map.set(String(row._id), index + 1);
  });
  return map;
}

async function getGlobalLeaderboard({ page, limit, currentUserId }) {
  const key = `global:${page}:${limit}:${currentUserId || 'none'}`;
  const cached = getCache(key);
  if (cached) return cached;

  const skip = (page - 1) * limit;
  const [total, rows] = await Promise.all([
    Leaderboard.countDocuments(),
    Leaderboard.find()
      .populate('userId', 'name email')
      .sort({ globalRank: 1, totalScore: -1, averageAccuracy: -1, fastestCompletion: 1, quizzesPlayed: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  let currentUserRank = null;
  if (currentUserId) {
    const current = await Leaderboard.findOne({ userId: currentUserId }).select('globalRank');
    currentUserRank = current?.globalRank || null;
  }

  const payload = {
    total,
    page,
    limit,
    currentUserRank,
    rows: rows.map((row) => ({
      rank: row.globalRank,
      userId: row.userId?._id,
      name: row.userId?.name || 'Unknown',
      email: row.userId?.email || '',
      totalScore: row.totalScore,
      averageAccuracy: row.averageAccuracy,
      quizzesPlayed: row.quizzesPlayed,
      fastestCompletion: row.fastestCompletion,
      weeklyRank: row.weeklyRank,
      monthlyRank: row.monthlyRank,
    })),
  };

  setCache(key, payload);
  return payload;
}

async function getPeriodLeaderboard({ days, page, limit, currentUserId }) {
  const label = days === 7 ? 'weekly' : 'monthly';
  const key = `${label}:${page}:${limit}:${currentUserId || 'none'}`;
  const cached = getCache(key);
  if (cached) return cached;

  const start = new Date();
  start.setDate(start.getDate() - days);

  const grouped = await QuizSession.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: start },
      },
    },
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$totalPoints' },
        averageAccuracy: { $avg: '$accuracy' },
        quizzesPlayed: { $sum: 1 },
        fastestCompletion: { $min: '$timeTaken' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        name: '$user.name',
        email: '$user.email',
        totalPoints: 1,
        averageAccuracy: { $round: ['$averageAccuracy', 2] },
        quizzesPlayed: 1,
        fastestCompletion: 1,
      },
    },
  ]);

  grouped.sort(periodSort);

  const withRank = grouped.map((item, index) => ({ ...item, rank: index + 1 }));
  const total = withRank.length;
  const startIndex = (page - 1) * limit;
  const rows = withRank.slice(startIndex, startIndex + limit);

  const currentUserRank = currentUserId
    ? withRank.find((item) => String(item.userId) === String(currentUserId))?.rank || null
    : null;

  const payload = {
    total,
    page,
    limit,
    currentUserRank,
    rows,
  };

  setCache(key, payload);
  return payload;
}

module.exports = {
  updateUserLeaderboard,
  getGlobalLeaderboard,
  getPeriodLeaderboard,
  recomputeRanks,
  clearLeaderboardCache: clearCache,
};
