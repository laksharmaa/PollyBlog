const test = require('node:test');
const assert = require('node:assert/strict');

const { generateToken, generateRefreshToken } = require('../src/shared/auth');
const { createAction, consumeAction } = require('../src/shared/authActions');

process.env.USERS_TABLE = 'test-users';
process.env.REFRESH_TOKENS_TABLE = 'test-refresh';
process.env.AUTH_ACTIONS_TABLE = 'test-auth-actions';
process.env.JWT_SECRET = 'test-secret';

test('generateToken returns a valid JWT', () => {
  const token = generateToken({ username: 'alice' });
  assert.match(token, /^eyJ/);
  assert.ok(token.length > 20);
});

test('generateRefreshToken returns a usable refresh token object', () => {
  const refresh = generateRefreshToken();
  assert.ok(refresh.token);
  assert.ok(refresh.tokenId);
  assert.ok(refresh.token.length > 40);
});

test('createAction produces a hashed token and ttl metadata', () => {
  const action = createAction('email-verification', 'alice');
  assert.equal(action.type, 'email-verification');
  assert.equal(action.username, 'alice');
  assert.ok(action.token);
  assert.ok(action.tokenHash);
  assert.ok(action.expiresAt > 0);
  assert.ok(action.ttl > 0);
});

test('consumeAction resolves only valid matching tokens', async () => {
  const action = createAction('password-reset', 'bob');
  const original = { ...action };

  const same = await consumeAction(action.token, 'password-reset');
  assert.equal(same.username, 'bob');
  assert.equal(same.type, 'password-reset');

  const stale = await consumeAction(original.token, 'password-reset');
  assert.equal(stale, null);
});
