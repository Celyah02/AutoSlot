const generateTicketNumber = (parkingCode, entryId) => {
  const timestamp = Date.now();
  return `TKT-${parkingCode}-${entryId}-${timestamp}`.toUpperCase();
};

module.exports = { generateTicketNumber };
