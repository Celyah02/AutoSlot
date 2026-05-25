const express = require('express');
const cors = require('cors');
const reportingRoutes = require('./routes/reportingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reporting', reportingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
