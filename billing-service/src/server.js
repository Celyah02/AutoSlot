require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5004;
const SERVICE_NAME = process.env.SERVICE_NAME || 'billing-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
