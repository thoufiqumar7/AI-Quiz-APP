const xss = require('xss');

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, item]) => {
      if (key.startsWith('$') || key.includes('.')) return result;
      result[key] = sanitizeValue(item);
      return result;
    }, {});
  }

  if (typeof value === 'string') {
    return xss(value, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] }).trim();
  }

  return value;
}

function sanitizeInput(req, _res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);

  if (req.query) {
    Object.entries(req.query).forEach(([key, value]) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.query[key];
      } else {
        req.query[key] = sanitizeValue(value);
      }
    });
  }

  next();
}

module.exports = { sanitizeInput };
