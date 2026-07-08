const mongoose = require('mongoose');
const Category = require('../models/Category');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const Leaderboard = require('../models/Leaderboard');
const { calculateQuizScoring } = require('../services/scoringService');
const { updateUserLeaderboard } = require('../services/leaderboardService');
const { refreshUserAnalytics } = require('../services/analyticsService');
const { applyQuizGamification } = require('../services/gamificationService');
const { unlockEligibleAchievements } = require('../services/achievementService');

function shuffleArray(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function buildDifficultyDistribution(difficulty, count) {
  const weightMap = {
    easy: { easy: 0.7, medium: 0.2, hard: 0.1 },
    medium: { easy: 0.2, medium: 0.6, hard: 0.2 },
    hard: { easy: 0.1, medium: 0.2, hard: 0.7 },
  };

  const weights = weightMap[difficulty];
  const distribution = {
    easy: Math.floor(count * weights.easy),
    medium: Math.floor(count * weights.medium),
    hard: Math.floor(count * weights.hard),
  };

  let allocated = distribution.easy + distribution.medium + distribution.hard;
  while (allocated < count) {
    distribution[difficulty] += 1;
    allocated += 1;
  }

  return distribution;
}

async function sampleQuestions({ categoryId, difficulty, count, excludedIds = [] }) {
  const distribution = buildDifficultyDistribution(difficulty, count);
  const selected = [];
  const selectedIds = new Set();

  for (const level of ['easy', 'medium', 'hard']) {
    const size = distribution[level];
    if (size <= 0) continue;

    const pool = await Question.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
          difficulty: level,
          _id: {
            $nin: [...excludedIds, ...selected.map((question) => question._id)],
          },
        },
      },
      { $sample: { size } },
    ]);

    pool.forEach((question) => {
      const id = String(question._id);
      if (!selectedIds.has(id)) {
        selectedIds.add(id);
        selected.push(question);
      }
    });
  }

  if (selected.length < count) {
    const missing = count - selected.length;
    const fallbackPool = await Question.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
          _id: {
            $nin: [...excludedIds, ...selected.map((question) => question._id)],
          },
        },
      },
      { $sample: { size: missing } },
    ]);

    fallbackPool.forEach((question) => {
      const id = String(question._id);
      if (!selectedIds.has(id)) {
        selectedIds.add(id);
        selected.push(question);
      }
    });
  }

  if (selected.length < count && excludedIds.length > 0) {
    const missing = count - selected.length;
    const reusePool = await Question.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
          _id: {
            $nin: selected.map((question) => question._id),
          },
        },
      },
      { $sample: { size: missing } },
    ]);

    reusePool.forEach((question) => {
      const id = String(question._id);
      if (!selectedIds.has(id)) {
        selectedIds.add(id);
        selected.push(question);
      }
    });
  }

  return shuffleArray(selected).slice(0, count);
}

function buildPublicQuestion(question) {
  return {
    id: question._id,
    category: question.category,
    difficulty: question.difficulty,
    topic: question.topic || 'General',
    question: question.question,
    options: shuffleArray(question.options),
  };
}

async function startQuiz(req, res, next) {
  try {
    const { categoryId, difficulty, count } = req.query;

    const category = await Category.findById(categoryId).select('name description icon');
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    const previousQuestionIds = await QuizSession.distinct('questions', {
      userId: req.user._id,
      category: category._id,
      status: 'completed',
    });

    const questions = await sampleQuestions({
      categoryId,
      difficulty,
      count,
      excludedIds: previousQuestionIds,
    });

    if (!questions.length || questions.length < Math.min(count, 3)) {
      const error = new Error('Not enough questions available for this category.');
      error.statusCode = 400;
      throw error;
    }

    const timeLimitSec = questions.length * 30;

    const session = await QuizSession.create({
      userId: req.user._id,
      questions: questions.map((question) => question._id),
      score: 0,
      difficulty,
      category: category._id,
      startedAt: new Date(),
      questionCount: questions.length,
      timeLimitSec,
      status: 'in_progress',
    });

    res.json({
      success: true,
      quiz: {
        sessionId: session._id,
        category: {
          id: category._id,
          name: category.name,
          description: category.description,
          icon: category.icon,
        },
        difficulty,
        questionCount: questions.length,
        startedAt: session.startedAt,
        timeLimitSec,
        questions: questions.map(buildPublicQuestion),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function submitQuiz(req, res, next) {
  try {
    const { sessionId, answers } = req.body;

    const session = await QuizSession.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'in_progress',
    })
      .populate('questions', 'question options answer explanation category difficulty topic')
      .populate('category', 'name');

    if (!session) {
      const error = new Error('Quiz session not found or already submitted.');
      error.statusCode = 404;
      throw error;
    }

    const answerMap = new Map(
      answers.map((entry) => [String(entry.questionId), entry.selectedOption ?? null])
    );
    const sessionQuestionIds = new Set(session.questions.map((question) => String(question._id)));
    const invalidAnswer = answers.find((entry) => !sessionQuestionIds.has(String(entry.questionId)));
    if (invalidAnswer) {
      const error = new Error('Submitted answers contain invalid question ids.');
      error.statusCode = 400;
      throw error;
    }

    const answerDetails = session.questions.map((question) => {
      const selectedOption = answerMap.get(String(question._id)) ?? null;
      const isCorrect = selectedOption === question.answer;

      return {
        questionId: question._id,
        question: question.question,
        topic: question.topic || session.category?.name || 'General',
        difficulty: question.difficulty,
        options: question.options,
        selectedOption,
        correctAnswer: question.answer,
        explanation: question.explanation,
        isCorrect,
      };
    });

    const completedAt = new Date();
    const timeTaken = Math.max(0, Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000));

    const scoring = calculateQuizScoring({
      answerDetails,
      timeTaken,
      timeLimitSec: session.timeLimitSec,
    });

    session.answerDetails = answerDetails;
    session.correctAnswers = scoring.correctAnswers;
    session.wrongAnswers = scoring.wrongAnswers;
    session.score = scoring.score;
    session.accuracy = scoring.accuracy;
    session.bonusPoints = scoring.bonusPoints;
    session.totalPoints = scoring.totalPoints;
    session.averageTimePerQuestion = scoring.averageTimePerQuestion;
    session.completedAt = completedAt;
    session.timeTaken = timeTaken;
    session.status = 'completed';

    await session.save();

    const gamification = await applyQuizGamification({
      userId: req.user._id,
      session,
      scoring,
    });

    const unlockedAchievements = await unlockEligibleAchievements(req.user._id);

    await Promise.all([updateUserLeaderboard(req.user._id), refreshUserAnalytics(req.user._id)]);

    const rankDoc = await Leaderboard.findOne({ userId: req.user._id }).select('globalRank');
    session.rank = rankDoc?.globalRank || null;
    await session.save();

    res.json({
      success: true,
      result: {
        sessionId: session._id,
        category: session.category?.name || '',
        difficulty: session.difficulty,
        totalQuestions: answerDetails.length,
        score: scoring.score,
        bonusPoints: scoring.bonusPoints,
        totalPoints: scoring.totalPoints,
        rank: session.rank,
        correctAnswers: scoring.correctAnswers,
        wrongAnswers: scoring.wrongAnswers,
        accuracy: scoring.accuracy,
        averageTimePerQuestion: scoring.averageTimePerQuestion,
        timeTaken,
        startedAt: session.startedAt,
        completedAt,
        scoreBreakdown: scoring.breakdown,
        xp: gamification.xp,
        streak: gamification.streak,
        badges: gamification.badges,
        unlockedAchievements: unlockedAchievements.unlocked,
        answers: answerDetails,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getQuizHistory(req, res, next) {
  try {
    const sessions = await QuizSession.find({ userId: req.user._id, status: 'completed' })
      .populate('category', 'name icon')
      .select('score bonusPoints totalPoints rank difficulty accuracy questionCount category startedAt completedAt timeTaken averageTimePerQuestion')
      .sort({ completedAt: -1 })
      .limit(50);

    const history = sessions.map((session) => ({
      id: session._id,
      score: session.score,
      bonusPoints: session.bonusPoints,
      totalPoints: session.totalPoints,
      rank: session.rank,
      difficulty: session.difficulty,
      accuracy: session.accuracy,
      questionCount: session.questionCount,
      category: session.category?.name || 'Unknown',
      categoryIcon: session.category?.icon || 'book-open',
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      timeTaken: session.timeTaken,
      averageTimePerQuestion: session.averageTimePerQuestion,
    }));

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startQuiz,
  submitQuiz,
  getQuizHistory,
};
