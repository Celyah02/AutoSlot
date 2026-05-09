require('dotenv').config();

const requiredEnvironmentVariables = ['JWT_SECRET', 'DATABASE_URL'];

requiredEnvironmentVariables.forEach((variableName) => {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
});

const app = require('./app');

const PORT = process.env.PORT || 5001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
