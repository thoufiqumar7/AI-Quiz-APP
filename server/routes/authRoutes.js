const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  profile,
  listSessions,
  revokeSession,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/csrf');
const { registerSchema, loginSchema, validateBody, z } = require('../middleware/validate');
const demoGuard = require('../middleware/demoGuard');

const router = express.Router();

function validateObjectIdParam(req, _res, next) {
  const result = z.string().regex(/^[0-9a-fA-F]{24}$/).safeParse(req.params.id);
  if (!result.success) {
    const error = new Error('Invalid session id.');
    error.statusCode = 400;
    return next(error);
  }
  return next();
}

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', requireCsrf, refresh);
router.post('/logout', requireCsrf, logout);
router.post('/logout-all', requireAuth, requireCsrf, demoGuard, logoutAll);
router.get('/profile', requireAuth, profile);
router.get('/sessions', requireAuth, listSessions);
router.delete('/sessions/:id', requireAuth, requireCsrf, demoGuard, validateObjectIdParam, revokeSession);

module.exports = router;
