const bcrypt = require('bcryptjs');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { success, error } = require('../../shared/response');

const TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return error(400, 'Username and password are required');
    }

    // Fix: the original code overwrote an existing user's password on
    // repeat "registration". Guard against that here.
    const existing = await docClient.send(new GetCommand({ TableName: TABLE, Key: { username } }));
    if (existing.Item) {
      return error(409, 'Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: { username, password: hashedPassword, createdAt: new Date().toISOString() },
    }));

    return success(201, { message: 'User registered successfully' });
  } catch (err) {
    console.error('register error:', err);
    return error(500, 'Could not register user');
  }
};
