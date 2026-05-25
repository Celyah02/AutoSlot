const express = require('express');
const {
  getRevenueSummary,
  listEnteredCars,
  listExitedCars
} = require('../controllers/reportingController');
const { ROLES } = require('../constants/roles');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { reportingQueryValidationRules } = require('../validators/reportingValidators');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'reporting-service',
    status: 'running',
    message: 'Reporting Service is working'
  });
});

router.get(
  '/entries',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  reportingQueryValidationRules,
  validateRequest,
  listEnteredCars
);

router.get(
  '/exits',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  reportingQueryValidationRules,
  validateRequest,
  listExitedCars
);

router.get(
  '/revenue',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  reportingQueryValidationRules,
  validateRequest,
  getRevenueSummary
);

module.exports = router;
