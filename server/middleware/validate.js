const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

function applyValidation(next, result) {
  if (!result.success) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.details = result.error.flatten();
    next(error);
    return false;
  }
  return true;
}

function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    const ok = applyValidation(next, result);
    if (!ok) return undefined;

    req.body = result.data;
    return next();
  };
}

function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    const ok = applyValidation(next, result);
    if (!ok) return undefined;

    req.query = result.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    const ok = applyValidation(next, result);
    if (!ok) return undefined;
    req.params = result.data;
    return next();
  };
}

module.exports = {
  z,
  registerSchema,
  loginSchema,
  validateBody,
  validateQuery,
  validateParams,
};
