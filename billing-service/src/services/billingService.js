const { AppError } = require('../utils/appError');

const BILLING_MINIMUM_MINUTES = 1;

const roundToTwoDecimals = (value) => Number(value.toFixed(2));

const calculateBillingDetails = ({
  entryDateTime,
  exitDateTime,
  chargingFeePerHour
}) => {
  const startTime = new Date(entryDateTime);
  const endTime = new Date(exitDateTime);
  const durationMilliseconds = endTime.getTime() - startTime.getTime();

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new AppError('Entry and exit times must be valid dates', 400);
  }

  if (durationMilliseconds < 0) {
    throw new AppError('Exit time cannot be earlier than entry time', 400);
  }

  // Bill at least one minute to avoid zero-charge exits caused by sub-minute stays.
  const durationMinutes = Math.max(
    BILLING_MINIMUM_MINUTES,
    Math.ceil(durationMilliseconds / (1000 * 60))
  );
  const durationHours = roundToTwoDecimals(durationMinutes / 60);
  const totalAmount = roundToTwoDecimals(durationHours * Number(chargingFeePerHour));

  return {
    durationMinutes,
    durationHours,
    totalAmount
  };
};

const createBillingRecord = async ({ client, entryId, ticketId }) => {
  const existingBillingResult = await client.query(
    'SELECT id FROM billings WHERE entry_id = $1 OR ticket_id = $2',
    [entryId, ticketId]
  );

  if (existingBillingResult.rows.length > 0) {
    throw new AppError('Billing has already been generated for this entry or ticket', 409);
  }

  const billingSourceResult = await client.query(
    `
      SELECT
        ce.id AS entry_id,
        ce.entry_date_time,
        ce.exit_date_time,
        ce.parking_code,
        t.id AS ticket_id,
        t.ticket_number,
        t.status AS ticket_status,
        pl.charging_fee_per_hour
      FROM car_entries ce
      INNER JOIN tickets t
        ON t.entry_id = ce.id
      INNER JOIN parking_locations pl
        ON pl.code = ce.parking_code
      WHERE ce.id = $1
        AND t.id = $2
      FOR UPDATE OF ce, t, pl
    `,
    [entryId, ticketId]
  );

  if (billingSourceResult.rows.length === 0) {
    throw new AppError('Entry, ticket, or parking details were not found for billing', 404);
  }

  const billingSource = billingSourceResult.rows[0];

  if (!billingSource.exit_date_time) {
    throw new AppError('Billing can only be generated after the car exit is recorded', 409);
  }

  if (billingSource.ticket_status !== 'closed') {
    throw new AppError('Billing can only be generated for a closed ticket', 409);
  }

  const billingDetails = calculateBillingDetails({
    entryDateTime: billingSource.entry_date_time,
    exitDateTime: billingSource.exit_date_time,
    chargingFeePerHour: billingSource.charging_fee_per_hour
  });

  await client.query(
    `
      UPDATE car_entries
      SET charged_amount = $1
      WHERE id = $2
    `,
    [billingDetails.totalAmount, entryId]
  );

  const billingInsertResult = await client.query(
    `
      INSERT INTO billings (
        entry_id,
        ticket_id,
        duration_minutes,
        duration_hours,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, entry_id, ticket_id, duration_minutes, duration_hours, total_amount, generated_at, payment_status
    `,
    [
      entryId,
      ticketId,
      billingDetails.durationMinutes,
      billingDetails.durationHours,
      billingDetails.totalAmount
    ]
  );

  return billingInsertResult.rows[0];
};

module.exports = {
  calculateBillingDetails,
  createBillingRecord
};
