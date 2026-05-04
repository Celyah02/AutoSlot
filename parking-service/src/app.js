const express = require('express');
const cors = require('cors');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/parking', parkingRoutes);

module.exports = app;
