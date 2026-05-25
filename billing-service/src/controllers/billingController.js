const pool = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { createBillingRecord } = require('../services/billingService');

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

const generateBilling = asyncHandler(async (req, res) => {
  const { entryId, ticketId } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const billing = await createBillingRecord({
      client,
      entryId,
      ticketId
    });

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Billing generated successfully',
      billing: sanitizeBilling(billing)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

const getBillingByEntryId = asyncHandler(async (req, res) => {
  const entryId = Number.parseInt(req.params.entryId, 10);

  const result = await pool.query(
    `
      SELECT id, entry_id, ticket_id, duration_minutes, duration_hours, total_amount, generated_at, payment_status
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
