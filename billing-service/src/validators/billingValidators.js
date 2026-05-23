const { body, param } = require('express-validator');

const billingGenerationValidationRules = [
  body('entryId')
    .notEmpty()
    .withMessage('Entry id is required')
    .isInt({ min: 1 })
    .withMessage('Entry id must be a positive integer'),
  body('ticketId')
    .notEmpty()
    .withMessage('Ticket id is required')
    .isInt({ min: 1 })
    .withMessage('Ticket id must be a positive integer'),
  body('durationMinutes')
    .notEmpty()
    .withMessage('Duration minutes is required')
    .isInt({ min: 0 })
    .withMessage('Duration minutes must be a non-negative integer'),
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number')
];

const entryIdValidationRules = [
  param('entryId')
    .notEmpty()
    .withMessage('Entry id is required')
    .isInt({ min: 1 })
    .withMessage('Entry id must be a positive integer')
];

module.exports = {
  billingGenerationValidationRules,
  entryIdValidationRules
};
