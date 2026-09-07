const { createAction, saveAction } = require('../../shared/authActions');
const { sendVerificationEmail } = require('../../shared/email');
const { findUserByEmail } = require('../../shared/users');
const { success, error } = require('../../shared/response');

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return error(400, 'Email is required');
    const user = await findUserByEmail(email);
    if (user?.email && !user.emailVerified) {
      const action = createAction('email-verification', user.username);
      await saveAction(action);
      await sendVerificationEmail(user.email, action.token);
    }
    return success(200, { message: 'If the account exists, a verification email has been sent' });
  } catch (err) {
    console.error('resend verification error:', err);
    return error(500, 'Could not resend verification email');
  }
};