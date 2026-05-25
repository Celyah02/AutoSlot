const express = require('express');
const cors = require('cors');
const gatewayRoutes = require('./routes/gatewayRoutes');
const { services } = require('./config/services');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { createServiceRouter } = require('./routes/serviceProxyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', gatewayRoutes);
app.use('/api/auth', createServiceRouter(services.auth));
app.use('/api/parking', createServiceRouter(services.parking));
app.use('/api/entry', createServiceRouter(services.entry));
app.use('/api/billing', createServiceRouter(services.billing));
app.use('/api/reporting', createServiceRouter(services.reporting));
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
