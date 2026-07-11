const { DEMO_EMAIL } = require('../services/demoUserService');

/**
 * Middleware to protect sensitive endpoints from the demo user.
 */
const demoGuard = (req, res, next) => {
  if (req.user && req.user.email === DEMO_EMAIL) {
    return res.status(403).json({
      success: false,
      message: 'This action is disabled in Demo Mode.',
      isDemoBlocked: true
    });
  }
  next();
};

module.exports = demoGuard;
