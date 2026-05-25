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
    .withMessage('Ticket id must be a positive integer')
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
