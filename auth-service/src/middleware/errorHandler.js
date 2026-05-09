const { AppError } = require('../utils/appError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (err.code === '23505') {
    return res.status(409).json({
      message: 'A record with the provided unique value already exists'
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      message: 'Database constraint validation failed'
    });
  }

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
