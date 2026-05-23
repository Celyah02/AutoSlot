const formatLog = (level, message, metadata = {}) => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  ...metadata
});

const logInfo = (message, metadata) => {
  console.log(JSON.stringify(formatLog('info', message, metadata)));
};

const logWarn = (message, metadata) => {
  console.warn(JSON.stringify(formatLog('warn', message, metadata)));
};

const logError = (message, metadata) => {
  console.error(JSON.stringify(formatLog('error', message, metadata)));
};

module.exports = {
  logError,
  logInfo,
  logWarn
};
