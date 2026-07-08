const crypto = require('crypto');
const { CSRF_COOKIE } = require('../services/tokenService');

function safeEqual(left, right) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function requireCsrf(req, _res, next) {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');

  if (!safeEqual(cookieToken, headerToken)) {
    const error = new Error('Invalid CSRF token.');
    error.statusCode = 403;
    return next(error);
  }

  return next();
}

module.exports = { requireCsrf };
