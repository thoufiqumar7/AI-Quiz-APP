const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateAccessToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'smartquiz-api',
    audience: 'smartquiz-client',
  });
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwtSecret, {
    issuer: 'smartquiz-api',
    audience: 'smartquiz-client',
  });

  if (payload.type !== 'access') {
    throw new Error('Invalid token type.');
  }

  return payload;
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateToken: generateAccessToken,
  verifyToken: verifyAccessToken,
};
