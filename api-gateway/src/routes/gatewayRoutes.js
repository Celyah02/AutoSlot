const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'running',
    message: 'API Gateway is working'
  });
});

module.exports = router;
