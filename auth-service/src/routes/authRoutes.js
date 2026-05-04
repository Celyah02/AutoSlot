const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'running',
    message: 'Auth Service is working'
  });
});

router.post('/register', (req, res) => {
  res.status(501).json({
    service: 'auth-service',
    endpoint: 'register',
    message: 'Registration logic has not been implemented yet'
  });
});

router.post('/login', (req, res) => {
  res.status(501).json({
    service: 'auth-service',
    endpoint: 'login',
    message: 'Login logic has not been implemented yet'
  });
});

router.get('/verify', (req, res) => {
  res.status(501).json({
    service: 'auth-service',
    endpoint: 'verify',
    message: 'JWT verification logic has not been implemented yet'
  });
});

module.exports = router;
