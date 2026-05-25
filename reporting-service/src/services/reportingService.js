const pool = require('../config/db');
const { AppError } = require('../utils/appError');

const buildFilterClause = ({ startDateTime, endDateTime, parkingCode, dateColumn }) => {
  const conditions = [
    `${dateColumn} BETWEEN $1 AND $2`
  ];
  const values = [startDateTime, endDateTime];

  if (parkingCode) {
    conditions.push(`ce.parking_code = $${values.length + 1}`);
    values.push(parkingCode);
  }

  return {
    whereClause: conditions.join(' AND '),
    values
  };
};

const appendPagination = ({ values, page, limit }) => {
  const offset = (page - 1) * limit;

  return {
    values: [...values, limit, offset],
    limitParameter: `$${values.length + 1}`,
    offsetParameter: `$${values.length + 2}`
  };
};

const validateDateRange = ({ startDateTime, endDateTime }) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('Start and end date-times must be valid ISO 8601 values', 400);
  }

  if (start > end) {
    throw new AppError('startDateTime cannot be later than endDateTime', 400);
  }
};

const normalizeOptions = (options) => {
  validateDateRange(options);

  return {
    ...options,
    page: Number.isInteger(options.page) ? options.page : Number.parseInt(options.page, 10),
    limit: Number.isInteger(options.limit) ? options.limit : Number.parseInt(options.limit, 10)
  };
};

const getExitedCarsReport = async (options) => {
  const normalizedOptions = normalizeOptions(options);
  const filters = buildFilterClause({
    ...normalizedOptions,
    dateColumn: 'ce.exit_date_time'
  });
  const pagination = appendPagination({
    values: filters.values,
    page: normalizedOptions.page,
    limit: normalizedOptions.limit
  });

  const [countResult, summaryResult, aggregatesResult, rowsResult] = await Promise.all([
    pool.query(
      `
        SELECT COUNT(*) AS total_items
        FROM car_entries ce
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          COUNT(*) AS total_exited_cars,
          COALESCE(SUM(ce.charged_amount), 0) AS total_amount_charged,
          COALESCE(AVG(ce.charged_amount), 0) AS average_amount_charged
        FROM car_entries ce
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          ce.parking_code,
          pl.parking_name,
          pl.location AS parking_location,
          COUNT(*) AS total_cars,
          COALESCE(SUM(ce.charged_amount), 0) AS total_revenue
        FROM car_entries ce
        INNER JOIN parking_locations pl
          ON pl.code = ce.parking_code
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
        GROUP BY ce.parking_code, pl.parking_name, pl.location
        ORDER BY ce.parking_code ASC
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          ce.id AS entry_id,
          ce.plate_number,
          ce.parking_code,
          pl.parking_name,
          pl.location AS parking_location,
          ce.entry_date_time,
          ce.exit_date_time,
          ce.charged_amount,
          b.id AS billing_id,
          b.duration_minutes,
          b.duration_hours,
          b.total_amount,
          b.generated_at,
          b.payment_status
        FROM car_entries ce
        INNER JOIN parking_locations pl
          ON pl.code = ce.parking_code
        LEFT JOIN billings b
          ON b.entry_id = ce.id
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
        ORDER BY ce.exit_date_time DESC, ce.id DESC
        LIMIT ${pagination.limitParameter}
        OFFSET ${pagination.offsetParameter}
      `,
      pagination.values
    )
  ]);

  return {
    totalItems: countResult.rows[0].total_items,
    summary: summaryResult.rows[0],
    byParkingLocation: aggregatesResult.rows,
    rows: rowsResult.rows
  };
};

const getEnteredCarsReport = async (options) => {
  const normalizedOptions = normalizeOptions(options);
  const filters = buildFilterClause({
    ...normalizedOptions,
    dateColumn: 'ce.entry_date_time'
  });
  const pagination = appendPagination({
    values: filters.values,
    page: normalizedOptions.page,
    limit: normalizedOptions.limit
  });

  const [countResult, summaryResult, aggregatesResult, rowsResult] = await Promise.all([
    pool.query(
      `
        SELECT COUNT(*) AS total_items
        FROM car_entries ce
        WHERE ${filters.whereClause}
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          COUNT(*) AS total_entered_cars,
          COALESCE(SUM(CASE WHEN ce.exit_date_time IS NULL THEN 1 ELSE 0 END), 0) AS active_entries,
          COALESCE(SUM(CASE WHEN ce.exit_date_time IS NOT NULL THEN 1 ELSE 0 END), 0) AS completed_entries
        FROM car_entries ce
        WHERE ${filters.whereClause}
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          ce.parking_code,
          pl.parking_name,
          pl.location AS parking_location,
          COUNT(*) AS total_cars,
          COALESCE(SUM(CASE WHEN ce.exit_date_time IS NULL THEN 1 ELSE 0 END), 0) AS active_entries,
          COALESCE(SUM(CASE WHEN ce.exit_date_time IS NOT NULL THEN 1 ELSE 0 END), 0) AS completed_entries
        FROM car_entries ce
        INNER JOIN parking_locations pl
          ON pl.code = ce.parking_code
        WHERE ${filters.whereClause}
        GROUP BY ce.parking_code, pl.parking_name, pl.location
        ORDER BY ce.parking_code ASC
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          ce.id AS entry_id,
          ce.plate_number,
          ce.parking_code,
          pl.parking_name,
          pl.location AS parking_location,
          ce.entry_date_time,
          ce.exit_date_time,
          ce.charged_amount,
          t.id AS ticket_id,
          t.ticket_number,
          t.status AS ticket_status,
          t.issued_at
        FROM car_entries ce
        INNER JOIN parking_locations pl
          ON pl.code = ce.parking_code
        LEFT JOIN tickets t
          ON t.entry_id = ce.id
        WHERE ${filters.whereClause}
        ORDER BY ce.entry_date_time DESC, ce.id DESC
        LIMIT ${pagination.limitParameter}
        OFFSET ${pagination.offsetParameter}
      `,
      pagination.values
    )
  ]);

  return {
    totalItems: countResult.rows[0].total_items,
    summary: summaryResult.rows[0],
    byParkingLocation: aggregatesResult.rows,
    rows: rowsResult.rows
  };
};

const getRevenueReport = async (options) => {
  const normalizedOptions = normalizeOptions(options);
  const filters = buildFilterClause({
    ...normalizedOptions,
    dateColumn: 'ce.exit_date_time'
  });

  const [summaryResult, aggregatesResult] = await Promise.all([
    pool.query(
      `
        SELECT
          COALESCE(SUM(ce.charged_amount), 0) AS total_revenue,
          COUNT(*) AS total_exited_cars,
          COUNT(b.id) AS total_billing_records,
          COALESCE(AVG(ce.charged_amount), 0) AS average_revenue_per_car,
          COALESCE(MAX(ce.charged_amount), 0) AS highest_charge,
          COALESCE(MIN(ce.charged_amount), 0) AS lowest_charge
        FROM car_entries ce
        LEFT JOIN billings b
          ON b.entry_id = ce.id
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
      `,
      filters.values
    ),
    pool.query(
      `
        SELECT
          ce.parking_code,
          pl.parking_name,
          pl.location AS parking_location,
          COUNT(*) AS total_cars,
          COALESCE(SUM(ce.charged_amount), 0) AS total_revenue
        FROM car_entries ce
        INNER JOIN parking_locations pl
          ON pl.code = ce.parking_code
        WHERE ce.exit_date_time IS NOT NULL
          AND ${filters.whereClause}
        GROUP BY ce.parking_code, pl.parking_name, pl.location
        ORDER BY total_revenue DESC, ce.parking_code ASC
      `,
      filters.values
    )
  ]);

  return {
    summary: summaryResult.rows[0],
    byParkingLocation: aggregatesResult.rows
  };
};

module.exports = {
  getEnteredCarsReport,
  getExitedCarsReport,
  getRevenueReport
};
