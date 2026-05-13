const { body, param, query } = require('express-validator');

const createParkingValidationRules = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters'),
  body('parkingName')
    .trim()
    .notEmpty()
    .withMessage('Parking name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Parking name must be between 2 and 150 characters'),
  body('numberOfAvailableSpaces')
    .notEmpty()
    .withMessage('Number of available spaces is required')
    .isInt({ min: 0 })
    .withMessage('Number of available spaces must be a non-negative integer'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
  body('chargingFeePerHour')
    .notEmpty()
    .withMessage('Charging fee per hour is required')
    .isFloat({ min: 0 })
    .withMessage('Charging fee per hour must be a non-negative number')
];

const paginationValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than or equal to 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
];

const parkingCodeValidationRules = [
  param('code')
    .trim()
    .notEmpty()
    .withMessage('Parking code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Parking code must be between 2 and 20 characters')
];

module.exports = {
  createParkingValidationRules,
  paginationValidationRules,
  parkingCodeValidationRules
};
