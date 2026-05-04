const express = require('express');
const cors = require('cors');
const billingRoutes = require('./routes/billingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/billing', billingRoutes);

module.exports = app;
