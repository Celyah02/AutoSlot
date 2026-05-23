const { logInfo } = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    logInfo('HTTP request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime
    });
  });

  next();
};

module.exports = requestLogger;
