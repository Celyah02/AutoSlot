require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5005;
const SERVICE_NAME = process.env.SERVICE_NAME || 'reporting-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
