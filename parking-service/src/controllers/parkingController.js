const pool = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const sanitizeParkingRecord = (parking) => ({
  code: parking.code,
  parkingName: parking.parking_name,
  totalSpaces: Number(parking.total_spaces),
  numberOfAvailableSpaces: Number(parking.available_spaces),
  location: parking.location,
  chargingFeePerHour: Number(parking.charging_fee_per_hour),
  createdAt: parking.created_at
});

const createParking = asyncHandler(async (req, res) => {
  const {
    code,
    parkingName,
    numberOfAvailableSpaces,
    location,
    chargingFeePerHour
  } = req.body;

  const normalizedCode = code.trim().toUpperCase();
  const sanitizedName = parkingName.trim();
  const sanitizedLocation = location.trim();
  const availableSpaces = Number(numberOfAvailableSpaces);
  const feePerHour = Number(chargingFeePerHour);

  const existingParking = await pool.query(
    'SELECT code FROM parking_locations WHERE code = $1',
    [normalizedCode]
  );

  if (existingParking.rows.length > 0) {
    throw new AppError('A parking location with that code already exists', 409);
  }

  const insertQuery = `
    INSERT INTO parking_locations (
      code,
      parking_name,
      total_spaces,
      available_spaces,
      location,
      charging_fee_per_hour
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING code, parking_name, total_spaces, available_spaces, location, charging_fee_per_hour, created_at
  `;

  const result = await pool.query(insertQuery, [
    normalizedCode,
    sanitizedName,
    availableSpaces,
    availableSpaces,
    sanitizedLocation,
    feePerHour
  ]);

  res.status(201).json({
    message: 'Parking location created successfully',
    parking: sanitizeParkingRecord(result.rows[0]),
    note: 'The initial total spaces are set to the same value as numberOfAvailableSpaces at creation time.'
  });
});

const listParkingLocations = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM parking_locations');

  const parkingResult = await pool.query(
    `
      SELECT code, parking_name, total_spaces, available_spaces, location, charging_fee_per_hour, created_at
      FROM parking_locations
      ORDER BY created_at DESC, code ASC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const totalItems = countResult.rows[0].total;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  res.status(200).json({
    message: 'Parking locations retrieved successfully',
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    data: parkingResult.rows.map(sanitizeParkingRecord)
  });
});

const getParkingByCode = asyncHandler(async (req, res) => {
  const parkingCode = req.params.code.trim().toUpperCase();

  const result = await pool.query(
    `
      SELECT code, parking_name, total_spaces, available_spaces, location, charging_fee_per_hour, created_at
      FROM parking_locations
      WHERE code = $1
    `,
    [parkingCode]
  );

  if (result.rows.length === 0) {
    throw new AppError('Parking location not found', 404);
  }

  res.status(200).json({
    parking: sanitizeParkingRecord(result.rows[0])
  });
});

module.exports = {
  createParking,
  getParkingByCode,
  listParkingLocations
};
