const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Signs a short-lived access token for the given payload. */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('base64url');
  return { token, tokenId: hashRefreshToken(token) };
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Reads and verifies the Bearer token from an API Gateway HTTP API v2
 * event. Throws an Error with a `.statusCode` set (401 or 400) on failure,
 * so handlers can just catch it and pass err.statusCode/err.message to
 * response.error().
 */
function verifyRequest(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    const err = new Error('Access denied, no token provided');
    err.statusCode = 401;
    throw err;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
  verifyRequest,
};
