const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication is required', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to access this resource', 403));
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles
};
