const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'running',
    message: 'API Gateway is online',
    routes: {
      auth: '/api/auth',
      parking: '/api/parking',
      entry: '/api/entry',
      billing: '/api/billing',
      reporting: '/api/reporting'
    }
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'running',
    message: 'API Gateway is working'
  });
});

module.exports = router;
