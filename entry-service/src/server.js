require('dotenv').config();

const requiredEnvironmentVariables = ['DATABASE_URL', 'JWT_SECRET', 'BILLING_SERVICE_URL'];

requiredEnvironmentVariables.forEach((variableName) => {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
});

const app = require('./app');

const PORT = process.env.PORT || 5003;
const SERVICE_NAME = process.env.SERVICE_NAME || 'entry-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
