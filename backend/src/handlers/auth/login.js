const bcrypt = require('bcryptjs');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const {
  generateToken,
  generateRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return error(400, 'Username and password are required');
    }

    const result = await docClient.send(new GetCommand({ TableName: TABLE, Key: { username } }));
    const user = result.Item;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return error(401, 'Invalid username or password');
    }
    if (user.email && user.emailVerified === false) {
      return error(403, 'Please verify your email before signing in');
    }

    const accessToken = generateToken({ username: user.username });
    const refresh = generateRefreshToken();
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS;

    await docClient.send(new PutCommand({
      TableName: process.env.REFRESH_TOKENS_TABLE,
      Item: {
        tokenId: refresh.tokenId,
        username: user.username,
        expiresAt,
        ttl: expiresAt,
      },
    }));

    return success(200, { accessToken, token: accessToken, refreshToken: refresh.token });
  } catch (err) {
    console.error('login error:', err);
    return error(500, 'Could not log in user');
  }
};
