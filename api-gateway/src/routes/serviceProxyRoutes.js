const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { createServiceProxy } = require('../middleware/proxyMiddleware');

const createServiceRouter = ({ serviceName, targetBaseUrl, publicPaths = [] }) => {
  const router = express.Router();
  const proxyMiddleware = createServiceProxy({ serviceName, targetBaseUrl });

  publicPaths.forEach((publicPath) => {
    router.use(publicPath, proxyMiddleware);
  });

  router.use(authenticate, proxyMiddleware);

  return router;
};

module.exports = {
  createServiceRouter
};
