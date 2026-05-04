const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'reporting-service',
    status: 'running',
    message: 'Reporting Service is working'
  });
});

router.get('/occupancy', (req, res) => {
  res.status(501).json({
    service: 'reporting-service',
    endpoint: 'occupancy',
    message: 'Location occupancy reporting has not been implemented yet'
  });
});

router.get('/realtime', (req, res) => {
  res.status(501).json({
    service: 'reporting-service',
    endpoint: 'realtime',
    message: 'Real-time reporting has not been implemented yet'
  });
});

module.exports = router;
