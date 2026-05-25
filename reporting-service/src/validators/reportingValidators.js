const { query } = require('express-validator');

const reportingQueryValidationRules = [
  query('startDateTime')
    .notEmpty()
    .withMessage('startDateTime is required')
    .isISO8601()
    .withMessage('startDateTime must be a valid ISO 8601 date-time'),
  query('endDateTime')
    .notEmpty()
    .withMessage('endDateTime is required')
    .isISO8601()
    .withMessage('endDateTime must be a valid ISO 8601 date-time'),
  query('parkingCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('parkingCode must be between 2 and 20 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
];

module.exports = {
  reportingQueryValidationRules
};
