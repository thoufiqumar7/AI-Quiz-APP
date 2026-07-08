const Category = require('../models/Category');
const QuizSession = require('../models/QuizSession');
const User = require('../models/User');
const DailyChallenge = require('../models/DailyChallenge');
const { applyXP } = require('./gamificationService');

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDateKey(date = new Date()) {
  const copy = startOfDay(date);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, '0')}-${String(copy.getDate()).padStart(2, '0')}`;
}

async function generateDailyChallenge(targetDate = new Date()) {
  const activeDate = startOfDay(targetDate);
  const dateKey = formatDateKey(activeDate);

  const existing = await DailyChallenge.findOne({ activeDate }).populate('category', 'name icon');
  if (existing) return existing;

  const categories = await Category.find().select('name description icon').lean();
  if (!categories.length) {
    throw new Error('No categories available to generate challenge.');
  }

  const categoryIndex = Math.abs(hashString(dateKey)) % categories.length;
  const category = categories[categoryIndex];

  const difficulties = ['easy', 'medium', 'hard'];
  const difficulty = difficulties[Math.abs(hashString(`${dateKey}-difficulty`)) % difficulties.length];

  const rewardXP = difficulty === 'hard' ? 120 : difficulty === 'medium' ? 90 : 70;

  const title = `Daily ${difficulty[0].toUpperCase()}${difficulty.slice(1)} Challenge`;
  const description = `Complete one ${difficulty} ${category.name} quiz today with at least 60% accuracy.`;

  try {
    const challenge = await DailyChallenge.create({
      title,
      description,
      category: category._id,
      difficulty,
      rewardXP,
      activeDate,
    });

    return DailyChallenge.findById(challenge._id).populate('category', 'name icon');
  } catch (error) {
    if (error.code === 11000) {
      return DailyChallenge.findOne({ activeDate }).populate('category', 'name icon');
    }
    throw error;
  }
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function getDailyChallengeForUser(userId, date = new Date()) {
  const challenge = await generateDailyChallenge(date);
  const user = await User.findById(userId).select('completedChallenges');

  const completed = (user.completedChallenges || []).some(
    (id) => String(id) === String(challenge._id)
  );

  return {
    id: challenge._id,
    title: challenge.title,
    description: challenge.description,
    category: {
      id: challenge.category?._id,
      name: challenge.category?.name,
      icon: challenge.category?.icon,
    },
    difficulty: challenge.difficulty,
    rewardXP: challenge.rewardXP,
    activeDate: challenge.activeDate,
    completed,
  };
}

async function completeDailyChallenge(userId, challengeId) {
  const today = startOfDay(new Date());

  const challenge = await DailyChallenge.findById(challengeId).populate('category', 'name');
  if (!challenge) {
    const error = new Error('Challenge not found.');
    error.statusCode = 404;
    throw error;
  }

  if (startOfDay(challenge.activeDate).getTime() !== today.getTime()) {
    const error = new Error('Challenge is expired or not active today.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const alreadyDone = (user.completedChallenges || []).some((id) => String(id) === String(challenge._id));
  if (alreadyDone) {
    const error = new Error('Challenge already completed.');
    error.statusCode = 409;
    throw error;
  }

  const qualifyingSession = await QuizSession.findOne({
    userId,
    status: 'completed',
    category: challenge.category._id,
    difficulty: challenge.difficulty,
    accuracy: { $gte: 60 },
    completedAt: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (!qualifyingSession) {
    const error = new Error('Complete a matching quiz today with at least 60% accuracy to claim this reward.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(user.completedChallenges)) user.completedChallenges = [];
  user.completedChallenges.push(challenge._id);
  if (!Array.isArray(user.badges)) user.badges = [];
  if (!user.badges.includes('Daily Challenger')) {
    user.badges.push('Daily Challenger');
  }
  await user.save();

  const xpState = await applyXP(userId, challenge.rewardXP);

  return {
    challenge: {
      id: challenge._id,
      title: challenge.title,
      rewardXP: challenge.rewardXP,
    },
    xp: {
      earned: challenge.rewardXP,
      totalXP: xpState.xpPoints,
      currentLevel: xpState.currentLevel,
      progress: xpState.progress,
    },
  };
}

module.exports = {
  getDailyChallengeForUser,
  completeDailyChallenge,
  generateDailyChallenge,
};
