const bcrypt = require('bcryptjs');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { createAction, saveAction } = require('../../shared/authActions');
const { sendVerificationEmail } = require('../../shared/email');
const { findUserByEmail } = require('../../shared/users');
const { success, error } = require('../../shared/response');

const TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { username, email, password } = JSON.parse(event.body || '{}');

    if (!username || !email || !password) {
      return error(400, 'Username, email, and password are required');
    }
    if (password.length < 8) return error(400, 'Password must be at least 8 characters');

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Fix: the original code overwrote an existing user's password on
    // repeat "registration". Guard against that here.
    const existing = await docClient.send(new GetCommand({ TableName: TABLE, Key: { username: normalizedUsername } }));
    if (existing.Item) {
      return error(409, 'Username already taken');
    }
    if (await findUserByEmail(normalizedEmail)) {
      return error(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: {
        username: normalizedUsername,
        email: normalizedEmail,
        emailVerified: false,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      },
    }));
    const verification = createAction('email-verification', normalizedUsername);
    await saveAction(verification);
    const verificationEmailSent = await sendVerificationEmail(normalizedEmail, verification.token);

    return success(201, {
      message: 'User registered successfully. Check your email to verify your account.',
      verificationEmailSent,
    });
  } catch (err) {
    console.error('register error:', err);
    return error(500, 'Could not register user');
  }
};
