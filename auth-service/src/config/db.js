const { Pool } = require('pg');

const requiredEnvironmentVariables = ['DATABASE_URL'];

requiredEnvironmentVariables.forEach((variableName) => {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
