const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'parking-service',
    status: 'running',
    message: 'Parking Service is working'
  });
});

router.get('/spaces', (req, res) => {
  res.status(501).json({
    service: 'parking-service',
    endpoint: 'spaces',
    message: 'Available parking lookup has not been implemented yet'
  });
});

router.post('/bookings', (req, res) => {
  res.status(501).json({
    service: 'parking-service',
    endpoint: 'bookings',
    message: 'Parking space booking has not been implemented yet'
  });
});

module.exports = router;
