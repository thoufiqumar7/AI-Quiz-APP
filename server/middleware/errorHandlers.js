const logger = require('../config/logger');

function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function normalizeError(error) {
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: 'Database validation failed.',
      details: Object.values(error.errors).map((item) => item.message),
    };
  }

  if (error.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${error.path}.` };
  }

  if (error.code === 11000) {
    return {
      statusCode: 409,
      message: `Duplicate value for ${Object.keys(error.keyPattern || {}).join(', ') || 'unique field'}.`,
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal server error.',
    details: error.details,
  };
}

function errorHandler(error, req, res, _next) {
  const normalized = normalizeError(error);

  req.log?.[normalized.statusCode >= 500 ? 'error' : 'warn'](
    {
      error,
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?._id,
    },
    normalized.message
  );

  if (!req.log) logger.error({ error }, normalized.message);

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.statusCode >= 500 ? 'Internal server error.' : normalized.message,
    details: normalized.statusCode < 500 ? normalized.details : undefined,
    requestId: req.id,
  });
}

module.exports = { notFoundHandler, errorHandler };
