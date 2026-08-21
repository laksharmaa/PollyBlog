const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/** Signs a new token for the given payload (e.g. { username }). */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
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
    err.statusCode = 400;
    throw err;
  }
}

module.exports = { generateToken, verifyRequest };
