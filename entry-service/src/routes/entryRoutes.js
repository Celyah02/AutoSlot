const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'entry-service',
    status: 'running',
    message: 'Entry Service is working'
  });
});

router.post('/entries', (req, res) => {
  res.status(501).json({
    service: 'entry-service',
    endpoint: 'entries',
    message: 'Vehicle entry tracking has not been implemented yet'
  });
});

router.post('/exits', (req, res) => {
  res.status(501).json({
    service: 'entry-service',
    endpoint: 'exits',
    message: 'Vehicle exit tracking has not been implemented yet'
  });
});

router.get('/durations', (req, res) => {
  res.status(501).json({
    service: 'entry-service',
    endpoint: 'durations',
    message: 'Parking duration monitoring has not been implemented yet'
  });
});

module.exports = router;
