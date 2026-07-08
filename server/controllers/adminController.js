const Achievement = require('../models/Achievement');
const Category = require('../models/Category');
const DailyChallenge = require('../models/DailyChallenge');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const User = require('../models/User');
const UserAchievement = require('../models/UserAchievement');
const { revokeAllUserSessions } = require('../services/tokenService');
const { getAdminDashboard, deleteUserAccount } = require('../services/adminService');
const cache = require('../services/cacheService');

function audit(req, action, targetId, metadata = {}) {
  req.log?.info(
    { adminId: req.user._id, action, targetId, metadata },
    'Admin action completed'
  );
}

async function dashboard(req, res, next) {
  try {
    res.json({ success: true, dashboard: await getAdminDashboard() });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, search, role, isBlocked } = req.query;
    const query = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (typeof isBlocked === 'boolean') query.isBlocked = isBlocked;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role rolePermissions isBlocked lastLogin xpPoints currentLevel streakCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

async function blockUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      const error = new Error('You cannot block your own account.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked: req.body.isBlocked } },
      { new: true, runValidators: true }
    ).select('name email role isBlocked');

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.isBlocked) await revokeAllUserSessions(user._id);
    cache.deleteByPrefix('admin:');
    audit(req, user.isBlocked ? 'user.block' : 'user.unblock', user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id) && req.body.role !== 'admin') {
      const error = new Error('You cannot remove your own admin role.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role: req.body.role, rolePermissions: req.body.rolePermissions || [] } },
      { new: true, runValidators: true }
    ).select('name email role rolePermissions isBlocked');

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    await revokeAllUserSessions(user._id);
    audit(req, 'user.role.update', user._id, { role: user.role });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

async function removeUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      const error = new Error('You cannot delete your own account.');
      error.statusCode = 400;
      throw error;
    }
    const exists = await User.exists({ _id: req.params.id });
    if (!exists) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    await deleteUserAccount(req.params.id);
    audit(req, 'user.delete', req.params.id);
    res.json({ success: true, message: 'User and related data deleted.' });
  } catch (error) {
    next(error);
  }
}

async function listQuestions(req, res, next) {
  try {
    const { page, limit, category, difficulty, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.question = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('category', 'name')
        .select('category difficulty topic question options answer explanation createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query),
    ]);
    res.json({ success: true, questions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

async function createQuestion(req, res, next) {
  try {
    const categoryExists = await Category.exists({ _id: req.body.category });
    if (!categoryExists) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }
    const question = await Question.create(req.body);
    cache.deleteByPrefix('admin:');
    audit(req, 'question.create', question._id);
    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      const error = new Error('Question not found.');
      error.statusCode = 404;
      throw error;
    }
    Object.assign(question, req.body);
    await question.save();
    audit(req, 'question.update', question._id);
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
}

async function removeQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      const error = new Error('Question not found.');
      error.statusCode = 404;
      throw error;
    }
    cache.deleteByPrefix('admin:');
    audit(req, 'question.delete', question._id);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (error) {
    next(error);
  }
}

async function listCategories(_req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    cache.deleteByPrefix('admin:');
    audit(req, 'category.create', category._id);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }
    cache.deleteByPrefix('admin:');
    audit(req, 'category.update', category._id);
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
}

async function removeCategory(req, res, next) {
  try {
    const references = await Promise.all([
      Question.countDocuments({ category: req.params.id }),
      QuizSession.countDocuments({ category: req.params.id }),
    ]);
    if (references.some(Boolean)) {
      const error = new Error('Category cannot be deleted while questions or quiz history reference it.');
      error.statusCode = 409;
      throw error;
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }
    cache.deleteByPrefix('admin:');
    audit(req, 'category.delete', category._id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
}

async function listChallenges(_req, res, next) {
  try {
    const challenges = await DailyChallenge.find()
      .populate('category', 'name')
      .sort({ activeDate: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, challenges });
  } catch (error) {
    next(error);
  }
}

async function createChallenge(req, res, next) {
  try {
    const challenge = await DailyChallenge.create(req.body);
    cache.deleteByPrefix('admin:');
    audit(req, 'challenge.create', challenge._id);
    res.status(201).json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
}

async function updateChallenge(req, res, next) {
  try {
    const challenge = await DailyChallenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!challenge) {
      const error = new Error('Challenge not found.');
      error.statusCode = 404;
      throw error;
    }
    audit(req, 'challenge.update', challenge._id);
    res.json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
}

async function removeChallenge(req, res, next) {
  try {
    const challenge = await DailyChallenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      const error = new Error('Challenge not found.');
      error.statusCode = 404;
      throw error;
    }
    await User.updateMany({}, { $pull: { completedChallenges: challenge._id } });
    cache.deleteByPrefix('admin:');
    audit(req, 'challenge.delete', challenge._id);
    res.json({ success: true, message: 'Challenge deleted.' });
  } catch (error) {
    next(error);
  }
}

async function listAchievements(_req, res, next) {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
}

async function createAchievement(req, res, next) {
  try {
    const achievement = await Achievement.create(req.body);
    cache.deleteByPrefix('admin:');
    audit(req, 'achievement.create', achievement._id);
    res.status(201).json({ success: true, achievement });
  } catch (error) {
    next(error);
  }
}

async function updateAchievement(req, res, next) {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!achievement) {
      const error = new Error('Achievement not found.');
      error.statusCode = 404;
      throw error;
    }
    audit(req, 'achievement.update', achievement._id);
    res.json({ success: true, achievement });
  } catch (error) {
    next(error);
  }
}

async function removeAchievement(req, res, next) {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      const error = new Error('Achievement not found.');
      error.statusCode = 404;
      throw error;
    }
    await Promise.all([
      UserAchievement.deleteMany({ achievementId: achievement._id }),
      User.updateMany({}, { $pull: { achievements: achievement._id, badges: achievement.title } }),
    ]);
    cache.deleteByPrefix('admin:');
    audit(req, 'achievement.delete', achievement._id);
    res.json({ success: true, message: 'Achievement deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard,
  listUsers,
  blockUser,
  updateUserRole,
  removeUser,
  listQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
  listCategories,
  createCategory,
  updateCategory,
  removeCategory,
  listChallenges,
  createChallenge,
  updateChallenge,
  removeChallenge,
  listAchievements,
  createAchievement,
  updateAchievement,
  removeAchievement,
};
