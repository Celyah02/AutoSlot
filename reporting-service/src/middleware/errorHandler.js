const { AppError } = require('../utils/appError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  if (err.code === '22P02') {
    return res.status(400).json({
      message: 'Invalid query parameter value'
    });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
