const { body } = require('express-validator');
const { ROLES } = require('../constants/roles');

const allowedRoles = [
  ROLES.ADMIN,
  ROLES.PARKING_ATTENDANT,
  'parking attendant'
];

const registerValidationRules = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const adminUserValidationRules = [
  ...registerValidationRules,
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .custom((value) => allowedRoles.includes(value.toLowerCase()))
    .withMessage('Role must be admin or parking attendant')
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  adminUserValidationRules,
  loginValidationRules,
  registerValidationRules
};
