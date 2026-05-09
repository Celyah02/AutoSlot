const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { ROLES } = require('../constants/roles');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const normalizeRole = (role) => {
  if (!role) {
    return ROLES.PARKING_ATTENDANT;
  }

  return role.toLowerCase().replace(/\s+/g, '_');
};

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role
});

const signToken = (user) =>
  jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

const sanitizeUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  role: user.role,
  createdAt: user.created_at
});

const createUserRecord = async ({
  firstName,
  lastName,
  email,
  password,
  role
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = normalizeRole(role || ROLES.PARKING_ATTENDANT);

  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('A user with that email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const insertQuery = `
    INSERT INTO users (first_name, last_name, email, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, first_name, last_name, email, role, created_at
  `;

  const result = await pool.query(insertQuery, [
    firstName.trim(),
    lastName.trim(),
    normalizedEmail,
    hashedPassword,
    normalizedRole
  ]);

  return result.rows[0];
};

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await createUserRecord({
    firstName,
    lastName,
    email,
    password,
    role: ROLES.PARKING_ATTENDANT
  });

  res.status(201).json({
    message: 'User registered successfully. Please login to continue.',
    user: sanitizeUser(user)
  });
});

const registerByAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const user = await createUserRecord({
    firstName,
    lastName,
    email,
    password,
    role
  });

  res.status(201).json({
    message: 'User created successfully by admin',
    user: sanitizeUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `
      SELECT id, first_name, last_name, email, password, role, created_at
      FROM users
      WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user);

  res.status(200).json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user)
  });
});

const verifyToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    user: req.user
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      WHERE id = $1
    `,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    user: sanitizeUser(result.rows[0])
  });
});

const getAdminAccess = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Admin access granted',
    permissions: 'full_access',
    user: req.user
  });
});

const getAttendantAccess = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Parking attendant access granted',
    permissions: 'limited_access',
    user: req.user
  });
});

module.exports = {
  getAdminAccess,
  getAttendantAccess,
  getProfile,
  login,
  registerByAdmin,
  register,
  verifyToken
};
