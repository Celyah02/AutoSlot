const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const buildHeaders = ({ token, hasJsonBody, customHeaders = {} }) => {
  const headers = {
    ...customHeaders
  };

  if (hasJsonBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async (path, options = {}) => {
  const { token, body, headers, ...restOptions } = options;
  const hasJsonBody = body !== undefined && body !== null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: buildHeaders({
      token,
      hasJsonBody,
      customHeaders: headers
    }),
    body: hasJsonBody ? JSON.stringify(body) : undefined
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors[0]?.message) ||
      'Request failed';

    throw new ApiError(message, response.status, payload);
  }

  return payload;
};

export const getErrorMessage = (error, fallbackMessage) => {
  if (error instanceof ApiError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const getFieldErrors = (error) => {
  if (!(error instanceof ApiError) || !Array.isArray(error.details?.errors)) {
    return {};
  }

  return error.details.errors.reduce((accumulator, item) => {
    if (item.field && item.message) {
      accumulator[item.field] = item.message;
    }

    return accumulator;
  }, {});
};
