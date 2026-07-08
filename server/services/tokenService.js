const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const env = require('../config/env');

const REFRESH_COOKIE = 'smartquiz_refresh';
const CSRF_COOKIE = 'smartquiz_csrf';
const MAX_ACTIVE_SESSIONS = 5;

function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function cookieOptions(httpOnly) {
  const production = env.nodeEnv === 'production';
  return {
    httpOnly,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    domain: env.cookieDomain,
    path: httpOnly ? '/api/auth' : '/',
    maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000,
  };
}

function setSessionCookies(res, refreshToken, csrfToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(true));
  res.cookie(CSRF_COOKIE, csrfToken, cookieOptions(false));
}

function clearSessionCookies(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions(true));
  res.clearCookie(CSRF_COOKIE, cookieOptions(false));
}

function getRequestMetadata(req) {
  return {
    userAgent: String(req.get('user-agent') || '').slice(0, 500),
    ipAddress: String(req.ip || req.socket?.remoteAddress || '').slice(0, 100),
  };
}

async function enforceSessionLimit(userId) {
  const active = await RefreshToken.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .select('_id')
    .lean();

  const overflow = active.slice(MAX_ACTIVE_SESSIONS);
  if (overflow.length) {
    await RefreshToken.updateMany(
      { _id: { $in: overflow.map((item) => item._id) } },
      { $set: { revokedAt: new Date() } }
    );
  }
}

async function issueRefreshSession(user, req, res) {
  const rawToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

  const record = await RefreshToken.create({
    userId: user._id,
    token: tokenHash,
    expiresAt,
    ...getRequestMetadata(req),
  });

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { refreshTokens: record._id },
  });

  await enforceSessionLimit(user._id);
  setSessionCookies(res, rawToken, csrfToken);

  return { record, csrfToken };
}

async function rotateRefreshSession(rawToken, req, res) {
  if (!rawToken) {
    const error = new Error('Refresh session is required.');
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(rawToken);
  const current = await RefreshToken.findOne({ token: tokenHash }).select('+token +replacedByToken');

  if (!current) {
    const error = new Error('Invalid refresh session.');
    error.statusCode = 401;
    throw error;
  }

  if (current.revokedAt) {
    await RefreshToken.updateMany(
      { userId: current.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    const error = new Error('Refresh token reuse detected. All sessions were revoked.');
    error.statusCode = 401;
    throw error;
  }

  if (current.expiresAt <= new Date()) {
    current.revokedAt = new Date();
    await current.save();
    const error = new Error('Refresh session expired.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(current.userId);
  if (!user || user.isBlocked) {
    current.revokedAt = new Date();
    await current.save();
    const error = new Error(user?.isBlocked ? 'Account is blocked.' : 'Session user no longer exists.');
    error.statusCode = user?.isBlocked ? 403 : 401;
    throw error;
  }

  const replacementRaw = createOpaqueToken();
  const replacementHash = hashToken(replacementRaw);
  const csrfToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

  const replacement = await RefreshToken.create({
    userId: user._id,
    token: replacementHash,
    expiresAt,
    ...getRequestMetadata(req),
  });

  current.revokedAt = new Date();
  current.replacedByToken = replacementHash;
  await current.save();

  await User.findByIdAndUpdate(user._id, {
    $pull: { refreshTokens: current._id },
    $addToSet: { refreshTokens: replacement._id },
  });

  setSessionCookies(res, replacementRaw, csrfToken);
  return { user, csrfToken };
}

async function revokeRefreshSession(rawToken, userId = null) {
  if (!rawToken) return;
  const query = { token: hashToken(rawToken), revokedAt: null };
  if (userId) query.userId = userId;

  const record = await RefreshToken.findOneAndUpdate(
    query,
    { $set: { revokedAt: new Date() } },
    { new: true }
  ).select('_id userId');

  if (record) {
    await User.findByIdAndUpdate(record.userId, { $pull: { refreshTokens: record._id } });
  }
}

async function revokeAllUserSessions(userId) {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
}

module.exports = {
  REFRESH_COOKIE,
  CSRF_COOKIE,
  hashToken,
  issueRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  revokeAllUserSessions,
  clearSessionCookies,
};
