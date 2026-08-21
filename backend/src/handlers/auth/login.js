const bcrypt = require('bcryptjs');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { generateToken } = require('../../shared/auth');
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

    const token = generateToken({ username: user.username });
    return success(200, { token });
  } catch (err) {
    console.error('login error:', err);
    return error(500, 'Could not log in user');
  }
};
