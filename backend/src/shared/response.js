/**
 * Small helpers so every handler returns API Gateway (HTTP API) responses
 * in a consistent shape. CORS headers are handled globally by the HttpApi
 * CorsConfiguration in template.yaml, so handlers don't need to set them.
 */

function success(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function error(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}

module.exports = { success, error };
