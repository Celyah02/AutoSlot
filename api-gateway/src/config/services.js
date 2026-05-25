const services = {
  auth: {
    serviceName: 'auth-service',
    targetBaseUrl: process.env.AUTH_SERVICE_URL,
    publicPaths: ['/health', '/login', '/register']
  },
  parking: {
    serviceName: 'parking-service',
    targetBaseUrl: process.env.PARKING_SERVICE_URL,
    publicPaths: ['/health']
  },
  entry: {
    serviceName: 'entry-service',
    targetBaseUrl: process.env.ENTRY_SERVICE_URL,
    publicPaths: ['/health']
  },
  billing: {
    serviceName: 'billing-service',
    targetBaseUrl: process.env.BILLING_SERVICE_URL,
    publicPaths: ['/health']
  },
  reporting: {
    serviceName: 'reporting-service',
    targetBaseUrl: process.env.REPORTING_SERVICE_URL,
    publicPaths: ['/health']
  }
};

module.exports = { services };
