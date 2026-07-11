const mongoose = require('mongoose');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./database/connectDB');
const { ensureDemoUser } = require('./services/demoUserService');
const metricsPersister = require('./services/ai/MetricsPersister');

let server;

async function startServer() {
  try {
    await connectDB();
    await ensureDemoUser();
    metricsPersister.start();
    server = app.listen(env.port, () => {
      logger.info({ port: env.port }, 'SmartQuiz API started');
    });
  } catch (error) {
    logger.fatal({ error }, 'Server bootstrap failed');
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown started');
  if (server) {
    metricsPersister.stop();
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close(false);
  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => logger.error({ error }, 'Unhandled rejection'));
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

startServer();
