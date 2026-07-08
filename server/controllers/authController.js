const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../services/authService');
const {
  REFRESH_COOKIE,
  issueRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  revokeAllUserSessions,
  clearSessionCookies,
} = require('../services/tokenService');
const { generateAccessToken } = require('../utils/jwt');

function safeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    rolePermissions: userDoc.rolePermissions || [],
    isBlocked: Boolean(userDoc.isBlocked),
    lastLogin: userDoc.lastLogin || null,
    xpPoints: userDoc.xpPoints || 0,
    currentLevel: userDoc.currentLevel || 1,
    streakCount: userDoc.streakCount || 0,
    longestStreak: userDoc.longestStreak || 0,
    badges: userDoc.badges || [],
    achievements: userDoc.achievements || [],
    lastQuizDate: userDoc.lastQuizDate || null,
    createdAt: userDoc.createdAt,
  };
}

function buildAuthResponse(user, csrfToken) {
  const accessToken = generateAccessToken({ sub: user._id, role: user.role });
  return { accessToken, token: accessToken, csrfToken, user: safeUser(user) };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email }).select('_id').lean();

    if (existingUser) {
      const error = new Error('Email is already in use.');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: 'user',
      lastLogin: new Date(),
    });

    const { csrfToken } = await issueRefreshSession(user, req, res);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      ...buildAuthResponse(user, csrfToken),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await comparePassword(password, user.password))) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      throw error;
    }

    if (user.isBlocked) {
      const error = new Error('Account is blocked. Contact support.');
      error.statusCode = 403;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save();

    const { csrfToken } = await issueRefreshSession(user, req, res);
    res.json({
      success: true,
      message: 'Login successful.',
      ...buildAuthResponse(user, csrfToken),
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { user, csrfToken } = await rotateRefreshSession(
      req.cookies?.[REFRESH_COOKIE],
      req,
      res
    );
    res.json({ success: true, ...buildAuthResponse(user, csrfToken) });
  } catch (error) {
    clearSessionCookies(res);
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await revokeRefreshSession(req.cookies?.[REFRESH_COOKIE]);
    clearSessionCookies(res);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
}

async function logoutAll(req, res, next) {
  try {
    await revokeAllUserSessions(req.user._id);
    clearSessionCookies(res);
    res.json({ success: true, message: 'All sessions were revoked.' });
  } catch (error) {
    next(error);
  }
}

async function profile(req, res) {
  res.json({ success: true, user: safeUser(req.user) });
}

async function listSessions(req, res, next) {
  try {
    const sessions = await RefreshToken.find({
      userId: req.user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select('createdAt expiresAt userAgent ipAddress')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

async function revokeSession(req, res, next) {
  try {
    const session = await RefreshToken.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
      { new: true }
    );

    if (!session) {
      const error = new Error('Active session not found.');
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: session._id } });
    res.json({ success: true, message: 'Session revoked.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  profile,
  listSessions,
  revokeSession,
};
