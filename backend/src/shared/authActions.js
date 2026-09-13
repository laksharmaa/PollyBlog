const crypto = require('crypto');
const { DeleteCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('./dynamo');

const ACTION_TTL_SECONDS = 60 * 60;

function getAuthActionsTable() {
  return process.env.AUTH_ACTIONS_TABLE;
}

function createAction(type, username) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + ACTION_TTL_SECONDS;
  return { token, tokenHash, type, username, expiresAt, ttl: expiresAt };
}

async function saveAction(action) {
  const tableName = getAuthActionsTable();
  await docClient.send(new PutCommand({ TableName: tableName, Item: action }));
}

async function consumeAction(token, type) {
  const tableName = getAuthActionsTable();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const result = await docClient.send(new GetCommand({ TableName: tableName, Key: { tokenHash } }));
  const action = result.Item;
  if (!action || action.type !== type || action.expiresAt <= Math.floor(Date.now() / 1000)) return null;
  await docClient.send(new DeleteCommand({ TableName: tableName, Key: { tokenHash } }));
  return action;
}

module.exports = { createAction, saveAction, consumeAction };