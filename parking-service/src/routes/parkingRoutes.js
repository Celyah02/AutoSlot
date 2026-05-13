const express = require('express');
const {
  createParking,
  getParkingByCode,
  listParkingLocations
} = require('../controllers/parkingController');
const { ROLES } = require('../constants/roles');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createParkingValidationRules,
  paginationValidationRules,
  parkingCodeValidationRules
} = require('../validators/parkingValidators');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'parking-service',
    status: 'running',
    message: 'Parking Service is working'
  });
});

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  createParkingValidationRules,
  validateRequest,
  createParking
);

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  paginationValidationRules,
  validateRequest,
  listParkingLocations
);

router.get(
  '/:code',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  parkingCodeValidationRules,
  validateRequest,
  getParkingByCode
);

module.exports = router;
