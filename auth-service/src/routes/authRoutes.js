const express = require('express');
const {
  getAdminAccess,
  getAttendantAccess,
  getProfile,
  login,
  registerByAdmin,
  register,
  verifyToken
} = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  adminUserValidationRules,
  loginValidationRules,
  registerValidationRules
} = require('../validators/authValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'running',
    message: 'Auth Service is working'
  });
});

router.post('/register', registerValidationRules, validateRequest, register);
router.post('/login', loginValidationRules, validateRequest, login);
router.post(
  '/admin/users',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  adminUserValidationRules,
  validateRequest,
  registerByAdmin
);
router.get('/verify', authenticate, verifyToken);
router.get('/me', authenticate, getProfile);
router.get('/admin/access', authenticate, authorizeRoles(ROLES.ADMIN), getAdminAccess);
router.get(
  '/attendant/access',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.PARKING_ATTENDANT),
  getAttendantAccess
);

module.exports = router;
