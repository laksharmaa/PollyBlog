const { DeleteCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const {
  generateRefreshToken,
  generateToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.REFRESH_TOKENS_TABLE;

exports.handler = async (event) => {
  try {
    const { refreshToken } = JSON.parse(event.body || '{}');
    if (!refreshToken) return error(401, 'Refresh token is required');

    const tokenId = hashRefreshToken(refreshToken);
    const result = await docClient.send(new GetCommand({ TableName: TABLE, Key: { tokenId } }));
    const session = result.Item;
    const now = Math.floor(Date.now() / 1000);

    if (!session || session.expiresAt <= now) {
      return error(401, 'Invalid or expired refresh token');
    }

    const nextRefresh = generateRefreshToken();
    const expiresAt = now + REFRESH_TOKEN_TTL_SECONDS;

    await docClient.send(new DeleteCommand({ TableName: TABLE, Key: { tokenId } }));
    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: {
        tokenId: nextRefresh.tokenId,
        username: session.username,
        expiresAt,
        ttl: expiresAt,
      },
    }));

    const accessToken = generateToken({ username: session.username });
    return success(200, { accessToken, token: accessToken, refreshToken: nextRefresh.token });
  } catch (err) {
    console.error('refresh error:', err);
    return error(500, 'Could not refresh session');
  }
};
