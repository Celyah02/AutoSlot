const { asyncHandler } = require('../utils/asyncHandler');
const {
  getEnteredCarsReport,
  getExitedCarsReport,
  getRevenueReport
} = require('../services/reportingService');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const toNumber = (value) => Number(value);

const sanitizeParkingLocationAggregate = (aggregate) => ({
  parkingCode: aggregate.parking_code,
  parkingName: aggregate.parking_name,
  parkingLocation: aggregate.parking_location,
  totalCars: toNumber(aggregate.total_cars),
  totalRevenue: aggregate.total_revenue !== undefined ? toNumber(aggregate.total_revenue) : undefined,
  activeEntries: aggregate.active_entries !== undefined ? toNumber(aggregate.active_entries) : undefined,
  completedEntries: aggregate.completed_entries !== undefined ? toNumber(aggregate.completed_entries) : undefined
});

const sanitizeExitedCar = (car) => ({
  entryId: car.entry_id,
  plateNumber: car.plate_number,
  parkingCode: car.parking_code,
  parkingName: car.parking_name,
  parkingLocation: car.parking_location,
  entryDateTime: car.entry_date_time,
  exitDateTime: car.exit_date_time,
  chargedAmount: toNumber(car.charged_amount),
  billing: car.billing_id
    ? {
        billingId: car.billing_id,
        durationMinutes: toNumber(car.duration_minutes),
        durationHours: toNumber(car.duration_hours),
        totalAmount: toNumber(car.total_amount),
        generatedAt: car.generated_at,
        paymentStatus: car.payment_status
      }
    : null
});

const sanitizeEnteredCar = (car) => ({
  entryId: car.entry_id,
  plateNumber: car.plate_number,
  parkingCode: car.parking_code,
  parkingName: car.parking_name,
  parkingLocation: car.parking_location,
  entryDateTime: car.entry_date_time,
  exitDateTime: car.exit_date_time,
  chargedAmount: toNumber(car.charged_amount),
  ticket: car.ticket_id
    ? {
        ticketId: car.ticket_id,
        ticketNumber: car.ticket_number,
        status: car.ticket_status,
        issuedAt: car.issued_at
      }
    : null
});

const buildFilters = ({ startDateTime, endDateTime, parkingCode }) => ({
  startDateTime,
  endDateTime,
  parkingCode: parkingCode || null
});

const buildPagination = ({ page, limit, totalItems }) => ({
  page,
  limit,
  totalItems,
  totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
  hasNextPage: page * limit < totalItems,
  hasPreviousPage: page > 1
});

const normalizeQueryOptions = (req) => ({
  startDateTime: req.query.startDateTime,
  endDateTime: req.query.endDateTime,
  parkingCode: req.query.parkingCode ? req.query.parkingCode.trim().toUpperCase() : undefined,
  page: req.query.page ? Number.parseInt(req.query.page, 10) : DEFAULT_PAGE,
  limit: req.query.limit ? Number.parseInt(req.query.limit, 10) : DEFAULT_LIMIT
});

const listExitedCars = asyncHandler(async (req, res) => {
  const options = normalizeQueryOptions(req);
  const report = await getExitedCarsReport(options);

  res.status(200).json({
    filters: buildFilters(options),
    summary: {
      totalExitedCars: toNumber(report.summary.total_exited_cars),
      totalAmountCharged: toNumber(report.summary.total_amount_charged),
      averageAmountCharged: toNumber(report.summary.average_amount_charged),
      byParkingLocation: report.byParkingLocation.map(sanitizeParkingLocationAggregate)
    },
    pagination: buildPagination({
      page: options.page,
      limit: options.limit,
      totalItems: toNumber(report.totalItems)
    }),
    data: report.rows.map(sanitizeExitedCar)
  });
});

const listEnteredCars = asyncHandler(async (req, res) => {
  const options = normalizeQueryOptions(req);
  const report = await getEnteredCarsReport(options);

  res.status(200).json({
    filters: buildFilters(options),
    summary: {
      totalEnteredCars: toNumber(report.summary.total_entered_cars),
      activeEntries: toNumber(report.summary.active_entries),
      completedEntries: toNumber(report.summary.completed_entries),
      byParkingLocation: report.byParkingLocation.map(sanitizeParkingLocationAggregate)
    },
    pagination: buildPagination({
      page: options.page,
      limit: options.limit,
      totalItems: toNumber(report.totalItems)
    }),
    data: report.rows.map(sanitizeEnteredCar)
  });
});

const getRevenueSummary = asyncHandler(async (req, res) => {
  const options = normalizeQueryOptions(req);
  const report = await getRevenueReport(options);

  res.status(200).json({
    filters: buildFilters(options),
    summary: {
      totalRevenue: toNumber(report.summary.total_revenue),
      totalExitedCars: toNumber(report.summary.total_exited_cars),
      totalBillingRecords: toNumber(report.summary.total_billing_records),
      averageRevenuePerCar: toNumber(report.summary.average_revenue_per_car),
      highestCharge: toNumber(report.summary.highest_charge),
      lowestCharge: toNumber(report.summary.lowest_charge),
      byParkingLocation: report.byParkingLocation.map(sanitizeParkingLocationAggregate)
    }
  });
});

module.exports = {
  getRevenueSummary,
  listEnteredCars,
  listExitedCars
};
