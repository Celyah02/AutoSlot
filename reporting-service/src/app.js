const express = require('express');
const cors = require('cors');
const reportingRoutes = require('./routes/reportingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reporting', reportingRoutes);

module.exports = app;
