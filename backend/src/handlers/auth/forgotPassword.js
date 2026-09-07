const { createAction, saveAction } = require('../../shared/authActions');
const { sendPasswordResetEmail } = require('../../shared/email');
const { findUserByEmail } = require('../../shared/users');
const { success, error } = require('../../shared/response');

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return error(400, 'Email is required');
    const user = await findUserByEmail(email);
    if (user?.email) {
      const action = createAction('password-reset', user.username);
      await saveAction(action);
      await sendPasswordResetEmail(user.email, action.token);
    }
    return success(200, { message: 'If the account exists, a password reset email has been sent' });
  } catch (err) {
    console.error('forgot password error:', err);
    return error(500, 'Could not start password reset');
  }
};