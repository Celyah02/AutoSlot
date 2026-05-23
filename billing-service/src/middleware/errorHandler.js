const { AppError } = require('../utils/appError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  if (err.code === '23503') {
    return res.status(400).json({
      message: 'Referenced entry or ticket does not exist'
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      message: 'Billing has already been generated for this record'
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      message: 'Database constraint validation failed'
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
