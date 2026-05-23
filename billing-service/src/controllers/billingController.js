const pool = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const sanitizeBilling = (billing) => ({
  id: billing.id,
  entryId: billing.entry_id,
  ticketId: billing.ticket_id,
  durationMinutes: Number(billing.duration_minutes),
  totalAmount: Number(billing.total_amount),
  generatedAt: billing.generated_at,
  paymentStatus: billing.payment_status
});

const generateBilling = asyncHandler(async (req, res) => {
  const { entryId, ticketId, durationMinutes, totalAmount } = req.body;

  const existingBilling = await pool.query(
    'SELECT id FROM billings WHERE entry_id = $1 OR ticket_id = $2',
    [entryId, ticketId]
  );

  if (existingBilling.rows.length > 0) {
    throw new AppError('Billing has already been generated for this entry or ticket', 409);
  }

  const result = await pool.query(
    `
      INSERT INTO billings (entry_id, ticket_id, duration_minutes, total_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING id, entry_id, ticket_id, duration_minutes, total_amount, generated_at, payment_status
    `,
    [entryId, ticketId, durationMinutes, totalAmount]
  );

  res.status(201).json({
    message: 'Billing generated successfully',
    billing: sanitizeBilling(result.rows[0])
  });
});

const getBillingByEntryId = asyncHandler(async (req, res) => {
  const entryId = Number.parseInt(req.params.entryId, 10);

  const result = await pool.query(
    `
      SELECT id, entry_id, ticket_id, duration_minutes, total_amount, generated_at, payment_status
      FROM billings
      WHERE entry_id = $1
    `,
    [entryId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Billing record not found', 404);
  }

  res.status(200).json({
    billing: sanitizeBilling(result.rows[0])
  });
});

module.exports = {
  generateBilling,
  getBillingByEntryId
};
