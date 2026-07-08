const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  csrfSecret: process.env.CSRF_SECRET || process.env.JWT_SECRET,
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  trustProxy: process.env.TRUST_PROXY === 'true',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  clientOrigins: (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (!env.mongoUri) {
  throw new Error('MONGO_URI is required.');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is required.');
}

if (!env.csrfSecret) {
  throw new Error('CSRF_SECRET is required.');
}

module.exports = env;
