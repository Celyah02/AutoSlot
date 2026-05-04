require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5003;
const SERVICE_NAME = process.env.SERVICE_NAME || 'entry-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
