const bcrypt = require('bcryptjs');
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { consumeAction } = require('../../shared/authActions');
const { success, error } = require('../../shared/response');

exports.handler = async (event) => {
  try {
    const { token, password } = JSON.parse(event.body || '{}');
    if (!token || !password) return error(400, 'Reset token and password are required');
    if (password.length < 8) return error(400, 'Password must be at least 8 characters');
    const action = await consumeAction(token, 'password-reset');
    if (!action) return error(400, 'Invalid or expired reset token');
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { username: action.username },
      UpdateExpression: 'SET password = :password',
      ExpressionAttributeValues: { ':password': await bcrypt.hash(password, 10) },
    }));
    return success(200, { message: 'Password reset successfully' });
  } catch (err) {
    console.error('reset password error:', err);
    return error(500, 'Could not reset password');
  }
};