const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { consumeAction } = require('../../shared/authActions');
const { success, error } = require('../../shared/response');

exports.handler = async (event) => {
  try {
    const token = JSON.parse(event.body || '{}').token;
    if (!token) return error(400, 'Verification token is required');
    const action = await consumeAction(token, 'email-verification');
    if (!action) return error(400, 'Invalid or expired verification token');
    const user = await docClient.send(new GetCommand({ TableName: process.env.USERS_TABLE, Key: { username: action.username } }));
    if (!user.Item) return error(404, 'User not found');
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { username: action.username },
      UpdateExpression: 'SET emailVerified = :verified',
      ExpressionAttributeValues: { ':verified': true },
    }));
    return success(200, { message: 'Email verified successfully' });
  } catch (err) {
    console.error('verify email error:', err);
    return error(500, 'Could not verify email');
  }
};