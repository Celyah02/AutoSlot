const express = require('express');
const cors = require('cors');
const entryRoutes = require('./routes/entryRoutes');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/entry', entryRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
