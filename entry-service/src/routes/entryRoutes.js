const express = require('express');
const {
  getParkingDuration,
  registerEntry,
  registerExit
} = require('../controllers/entryController');
const { ROLES } = require('../constants/roles');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  entryIdValidationRules,
  registerEntryValidationRules,
  registerExitValidationRules
} = require('../validators/entryValidators');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'entry-service',
    status: 'running',
    message: 'Entry Service is working'
  });
});

router.post(
  '/entries',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  registerEntryValidationRules,
  validateRequest,
  registerEntry
);

router.post(
  '/exits',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  registerExitValidationRules,
  validateRequest,
  registerExit
);

router.get(
  '/durations/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  entryIdValidationRules,
  validateRequest,
  getParkingDuration
);

module.exports = router;
