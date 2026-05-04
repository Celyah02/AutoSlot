const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'billing-service',
    status: 'running',
    message: 'Billing Service is working'
  });
});

router.get('/fees', (req, res) => {
  res.status(501).json({
    service: 'billing-service',
    endpoint: 'fees',
    message: 'Parking fee calculation has not been implemented yet'
  });
});

router.post('/payments', (req, res) => {
  res.status(501).json({
    service: 'billing-service',
    endpoint: 'payments',
    message: 'Payment processing has not been implemented yet'
  });
});

module.exports = router;
