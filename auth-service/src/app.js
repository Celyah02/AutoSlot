const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
