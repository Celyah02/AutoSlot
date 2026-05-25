const crypto = require('crypto');
const { AppError } = require('../utils/appError');

const decodeBase64Url = (value) => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
  const paddedValue = normalizedValue.padEnd(normalizedValue.length + paddingLength, '=');

  return Buffer.from(paddedValue, 'base64').toString('utf8');
};

const parseTokenSection = (value) => JSON.parse(decodeBase64Url(value));

const hasValidSignature = ({ headerSegment, payloadSegment, signatureSegment, secret }) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');
  const providedSignatureBuffer = Buffer.from(signatureSegment);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer);
};

const verifyToken = (token, secret) => {
  const segments = token.split('.');

  if (segments.length !== 3) {
    throw new AppError('Invalid or expired token', 401);
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const header = parseTokenSection(headerSegment);
  const payload = parseTokenSection(payloadSegment);

  if (header.alg !== 'HS256') {
    throw new AppError('Invalid or expired token', 401);
  }

  if (
    !hasValidSignature({
      headerSegment,
      payloadSegment,
      signatureSegment,
      secret
    })
  ) {
    throw new AppError('Invalid or expired token', 401);
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (payload.nbf && currentTimestamp < payload.nbf) {
    throw new AppError('Invalid or expired token', 401);
  }

  if (payload.exp && currentTimestamp >= payload.exp) {
    throw new AppError('Invalid or expired token', 401);
  }

  return payload;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is required', 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError('JWT secret is not configured', 500));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = {
  authenticate
};
