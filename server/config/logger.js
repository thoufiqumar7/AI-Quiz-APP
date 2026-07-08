const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: env.logLevel,
  base: {
    service: 'smartquiz-api',
    environment: env.nodeEnv,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'refreshToken',
    ],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
