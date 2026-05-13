const express = require('express');
const cors = require('cors');
const parkingRoutes = require('./routes/parkingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/parking', parkingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
