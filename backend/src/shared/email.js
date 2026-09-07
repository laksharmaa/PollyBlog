const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();
  if (!transport || !process.env.EMAIL_FROM) {
    console.warn('Email delivery is not configured');
    return false;
  }

  await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
  return true;
}

function actionUrl(path, token) {
  const baseUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  return `${baseUrl}${path}?token=${encodeURIComponent(token)}`;
}

async function sendVerificationEmail(email, token) {
  const url = actionUrl('/verify-email', token);
  return sendEmail({
    to: email,
    subject: 'Verify your Narrate account',
    text: `Verify your account by opening this link: ${url}`,
    html: `<p>Verify your Narrate account:</p><p><a href="${url}">Verify email address</a></p>`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const url = actionUrl('/reset-password', token);
  return sendEmail({
    to: email,
    subject: 'Reset your Narrate password',
    text: `Reset your password by opening this link: ${url}`,
    html: `<p>Reset your Narrate password:</p><p><a href="${url}">Reset password</a></p>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
