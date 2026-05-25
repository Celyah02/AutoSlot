const pool = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { logInfo, logError } = require('../utils/logger');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { createBillingRecord } = require('../../../billing-service/src/services/billingService');

const sanitizeEntry = (entry) => ({
  id: entry.id,
  plateNumber: entry.plate_number,
  parkingCode: entry.parking_code,
  entryDateTime: entry.entry_date_time,
  exitDateTime: entry.exit_date_time,
  chargedAmount: Number(entry.charged_amount),
  createdAt: entry.created_at
});

const sanitizeTicket = (ticket) => ({
  id: ticket.id,
  ticketNumber: ticket.ticket_number,
  entryId: ticket.entry_id,
  issuedAt: ticket.issued_at,
  status: ticket.status
});

const sanitizeBilling = (billing) => ({
  id: billing.id,
  entryId: billing.entry_id,
  ticketId: billing.ticket_id,
  durationMinutes: Number(billing.duration_minutes),
  durationHours: Number(billing.duration_hours),
  totalAmount: Number(billing.total_amount),
  generatedAt: billing.generated_at,
  paymentStatus: billing.payment_status
});

const registerEntry = asyncHandler(async (req, res) => {
  const { plateNumber, parkingCode } = req.body;
  const normalizedPlateNumber = plateNumber.trim().toUpperCase();
  const normalizedParkingCode = parkingCode.trim().toUpperCase();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const parkingResult = await client.query(
      `
        SELECT code, parking_name, available_spaces
        FROM parking_locations
        WHERE code = $1
        FOR UPDATE
      `,
      [normalizedParkingCode]
    );

    if (parkingResult.rows.length === 0) {
      throw new AppError('Parking location not found', 404);
    }

    const parkingLocation = parkingResult.rows[0];

    if (Number(parkingLocation.available_spaces) <= 0) {
      throw new AppError('Parking is full. Entry is not allowed', 409);
    }

    const activeEntryResult = await client.query(
      `
        SELECT id
        FROM car_entries
        WHERE plate_number = $1
          AND parking_code = $2
          AND exit_date_time IS NULL
      `,
      [normalizedPlateNumber, normalizedParkingCode]
    );

    if (activeEntryResult.rows.length > 0) {
      throw new AppError('This car already has an active entry in the selected parking location', 409);
    }

    const entryInsertResult = await client.query(
      `
        INSERT INTO car_entries (plate_number, parking_code)
        VALUES ($1, $2)
        RETURNING id, plate_number, parking_code, entry_date_time, exit_date_time, charged_amount, created_at
      `,
      [normalizedPlateNumber, normalizedParkingCode]
    );

    const createdEntry = entryInsertResult.rows[0];
    const ticketNumber = generateTicketNumber(normalizedParkingCode, createdEntry.id);

    const ticketInsertResult = await client.query(
      `
        INSERT INTO tickets (ticket_number, entry_id)
        VALUES ($1, $2)
        RETURNING id, ticket_number, entry_id, issued_at, status
      `,
      [ticketNumber, createdEntry.id]
    );

    await client.query(
      `
        UPDATE parking_locations
        SET available_spaces = available_spaces - 1
        WHERE code = $1
      `,
      [normalizedParkingCode]
    );

    await client.query('COMMIT');

    logInfo('Car entry registered', {
      entryId: createdEntry.id,
      plateNumber: normalizedPlateNumber,
      parkingCode: normalizedParkingCode,
      performedBy: req.user.email
    });

    res.status(201).json({
      message: 'Car entry registered successfully',
      entry: sanitizeEntry(createdEntry),
      ticket: sanitizeTicket(ticketInsertResult.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logError('Failed to register car entry', {
      plateNumber: normalizedPlateNumber,
      parkingCode: normalizedParkingCode,
      error: error.message
    });
    throw error;
  } finally {
    client.release();
  }
});

const registerExit = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.body;
  const normalizedTicketNumber = ticketNumber.trim().toUpperCase();
  const client = await pool.connect();
  let finalizedEntry;
  let finalizedTicket;
  let finalizedBilling;

  try {
    await client.query('BEGIN');

    const ticketResult = await client.query(
      `
        SELECT id, ticket_number, entry_id, issued_at, status
        FROM tickets
        WHERE ticket_number = $1
        FOR UPDATE
      `,
      [normalizedTicketNumber]
    );

    if (ticketResult.rows.length === 0) {
      throw new AppError('Ticket not found. Exit cannot be processed', 404);
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status === 'closed') {
      throw new AppError('This ticket has already been used for exit', 409);
    }

    const entryResult = await client.query(
      `
        SELECT id, plate_number, parking_code, entry_date_time, exit_date_time, charged_amount, created_at
        FROM car_entries
        WHERE id = $1
        FOR UPDATE
      `,
      [ticket.entry_id]
    );

    if (entryResult.rows.length === 0) {
      throw new AppError('No car entry exists for the provided ticket', 404);
    }

    const entry = entryResult.rows[0];

    if (entry.exit_date_time) {
      throw new AppError('This car has already exited', 409);
    }

    const parkingResult = await client.query(
      `
        SELECT code, parking_name, available_spaces, total_spaces, charging_fee_per_hour
        FROM parking_locations
        WHERE code = $1
        FOR UPDATE
      `,
      [entry.parking_code]
    );

    if (parkingResult.rows.length === 0) {
      throw new AppError('Parking location not found for this entry', 404);
    }

    const exitTimestamp = new Date();

    const updatedEntryResult = await client.query(
      `
        UPDATE car_entries
        SET exit_date_time = $1
        WHERE id = $2
        RETURNING id, plate_number, parking_code, entry_date_time, exit_date_time, charged_amount, created_at
      `,
      [exitTimestamp, entry.id]
    );

    const updatedTicketResult = await client.query(
      `
        UPDATE tickets
        SET status = 'closed'
        WHERE id = $1
        RETURNING id, ticket_number, entry_id, issued_at, status
      `,
      [ticket.id]
    );

    await client.query(
      `
        UPDATE parking_locations
        SET available_spaces = LEAST(total_spaces, available_spaces + 1)
        WHERE code = $1
      `,
      [entry.parking_code]
    );

    finalizedBilling = await createBillingRecord({
      client,
      entryId: entry.id,
      ticketId: ticket.id
    });

    await client.query('COMMIT');

    finalizedEntry = updatedEntryResult.rows[0];
    finalizedEntry.charged_amount = finalizedBilling.total_amount;
    finalizedTicket = updatedTicketResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logError('Failed to register car exit', {
      ticketNumber: normalizedTicketNumber,
      error: error.message
    });
    throw error;
  } finally {
    client.release();
  }

  logInfo('Car exit registered', {
    entryId: finalizedEntry.id,
    ticketNumber: finalizedTicket.ticket_number,
    plateNumber: finalizedEntry.plate_number,
    parkingCode: finalizedEntry.parking_code,
    performedBy: req.user.email,
    billingStatus: 'completed'
  });

  res.status(200).json({
    message: 'Car exit registered successfully',
    entry: sanitizeEntry(finalizedEntry),
    ticket: sanitizeTicket(finalizedTicket),
    bill: sanitizeBilling(finalizedBilling)
  });
});

const getParkingDuration = asyncHandler(async (req, res) => {
  const entryId = Number.parseInt(req.params.id, 10);

  const result = await pool.query(
    `
      SELECT id, plate_number, parking_code, entry_date_time, exit_date_time, charged_amount, created_at
      FROM car_entries
      WHERE id = $1
    `,
    [entryId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Car entry not found', 404);
  }

  const entry = result.rows[0];
  const endTime = entry.exit_date_time ? new Date(entry.exit_date_time) : new Date();
  const startTime = new Date(entry.entry_date_time);
  const durationMinutes = Math.max(0, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

  res.status(200).json({
    entry: sanitizeEntry(entry),
    duration: {
      durationMinutes,
      active: !entry.exit_date_time
    }
  });
});

module.exports = {
  getParkingDuration,
  registerEntry,
  registerExit
};
