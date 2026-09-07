const crypto = require('crypto');
const { DeleteCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('./dynamo');

const TABLE = process.env.AUTH_ACTIONS_TABLE;
const ACTION_TTL_SECONDS = 60 * 60;

function createAction(type, username) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + ACTION_TTL_SECONDS;
  return { token, tokenHash, type, username, expiresAt, ttl: expiresAt };
}

async function saveAction(action) {
  await docClient.send(new PutCommand({ TableName: TABLE, Item: action }));
}

async function consumeAction(token, type) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const result = await docClient.send(new GetCommand({ TableName: TABLE, Key: { tokenHash } }));
  const action = result.Item;
  if (!action || action.type !== type || action.expiresAt <= Math.floor(Date.now() / 1000)) return null;
  await docClient.send(new DeleteCommand({ TableName: TABLE, Key: { tokenHash } }));
  return action;
}

module.exports = { createAction, saveAction, consumeAction };