const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password');

    if (!user) {
      const error = new Error('Invalid token user.');
      error.statusCode = 401;
      throw error;
    }

    if (user.isBlocked) {
      const error = new Error('Account is blocked.');
      error.statusCode = 403;
      throw error;
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (err) {
    err.statusCode = err.statusCode || 401;
    return next(err);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('Insufficient role permissions.');
      error.statusCode = 403;
      return next(error);
    }
    return next();
  };
}

function requirePermission(permission) {
  return (req, _res, next) => {
    const allowed =
      req.user?.role === 'admin' || (req.user?.rolePermissions || []).includes(permission);
    if (!allowed) {
      const error = new Error(`Missing permission: ${permission}.`);
      error.statusCode = 403;
      return next(error);
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
};
