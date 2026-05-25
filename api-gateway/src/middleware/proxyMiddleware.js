const { AppError } = require('../utils/appError');

const REQUEST_TIMEOUT_MS = 15000;
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

const buildTargetUrl = (baseUrl, req) => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}${req.originalUrl}`;
};

const buildProxyHeaders = (req) => {
  const headers = {};

  Object.entries(req.headers).forEach(([headerName, headerValue]) => {
    if (HOP_BY_HOP_HEADERS.has(headerName.toLowerCase()) || headerValue === undefined) {
      return;
    }

    headers[headerName] = headerValue;
  });

  headers['x-forwarded-for'] = req.ip;
  headers['x-forwarded-host'] = req.get('host');
  headers['x-forwarded-proto'] = req.protocol;

  return headers;
};

const buildProxyBody = (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return undefined;
  }

  return JSON.stringify(req.body);
};

const forwardResponse = async (upstreamResponse, res) => {
  const contentType = upstreamResponse.headers.get('content-type');
  const location = upstreamResponse.headers.get('location');
  const responseBody = await upstreamResponse.text();

  if (contentType) {
    res.set('content-type', contentType);
  }

  if (location) {
    res.set('location', location);
  }

  res.status(upstreamResponse.status);

  if (!responseBody) {
    return res.end();
  }

  return res.send(responseBody);
};

const createServiceProxy = ({ serviceName, targetBaseUrl }) => async (req, res, next) => {
  if (!targetBaseUrl) {
    return next(new AppError(`Target URL is not configured for ${serviceName}`, 500));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(buildTargetUrl(targetBaseUrl, req), {
      method: req.method,
      headers: buildProxyHeaders(req),
      body: buildProxyBody(req),
      signal: controller.signal
    });

    clearTimeout(timeout);
    return await forwardResponse(upstreamResponse, res);
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      return next(new AppError(`${serviceName} request timed out`, 504));
    }

    return next(new AppError(`Unable to reach ${serviceName}`, 502));
  }
};

module.exports = {
  createServiceProxy
};
