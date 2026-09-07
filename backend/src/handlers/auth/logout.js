const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { hashRefreshToken } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

exports.handler = async (event) => {
  try {
    const { refreshToken } = JSON.parse(event.body || '{}');
    if (refreshToken) {
      await docClient.send(new DeleteCommand({
        TableName: process.env.REFRESH_TOKENS_TABLE,
        Key: { tokenId: hashRefreshToken(refreshToken) },
      }));
    }
    return success(200, { message: 'Logged out successfully' });
  } catch (err) {
    console.error('logout error:', err);
    return error(500, 'Could not log out user');
  }
};