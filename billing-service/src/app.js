const express = require('express');
const cors = require('cors');
const billingRoutes = require('./routes/billingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/billing', billingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
