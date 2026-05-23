const { body, param } = require('express-validator');

const registerEntryValidationRules = [
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('Plate number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Plate number must be between 3 and 20 characters'),
  body('parkingCode')
    .trim()
    .notEmpty()
    .withMessage('Parking code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Parking code must be between 2 and 20 characters')
];

const registerExitValidationRules = [
  body('ticketNumber')
    .trim()
    .notEmpty()
    .withMessage('Ticket number is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('Ticket number must be between 5 and 50 characters')
];

const entryIdValidationRules = [
  param('id')
    .notEmpty()
    .withMessage('Entry id is required')
    .isInt({ min: 1 })
    .withMessage('Entry id must be a positive integer')
];

module.exports = {
  entryIdValidationRules,
  registerEntryValidationRules,
  registerExitValidationRules
};
