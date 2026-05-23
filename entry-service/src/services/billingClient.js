const { logInfo } = require('../utils/logger');

const triggerBilling = async (payload) => {
  const url = `${process.env.BILLING_SERVICE_URL}/api/billing/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let responseBody = null;

  try {
    responseBody = await response.json();
  } catch (error) {
    responseBody = null;
  }

  if (!response.ok) {
    throw new Error(
      responseBody?.message || `Billing service responded with status ${response.status}`
    );
  }

  logInfo('Billing service trigger completed', {
    entryId: payload.entryId,
    ticketNumber: payload.ticketNumber
  });

  return {
    triggered: true,
    status: 'completed',
    message: 'Billing service was notified successfully',
    response: responseBody
  };
};

module.exports = { triggerBilling };
