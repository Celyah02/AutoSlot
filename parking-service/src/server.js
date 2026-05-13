require('dotenv').config();

const requiredEnvironmentVariables = ['DATABASE_URL', 'JWT_SECRET'];

requiredEnvironmentVariables.forEach((variableName) => {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
});

const app = require('./app');

const PORT = process.env.PORT || 5002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'parking-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
