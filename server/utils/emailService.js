const nodemailer = require('nodemailer');

const createTransporter = (overrides = {}) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  const baseConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for 587
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT || '15000', 10),
    greetingTimeout: parseInt(process.env.EMAIL_GREETING_TIMEOUT || '15000', 10),
    socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT || '30000', 10),
  };

  return nodemailer.createTransport({ ...baseConfig, ...overrides });
};

const shouldRetryWithFallback = (error) => {
  const code = error?.code || '';
  const command = error?.command || '';
  return code === 'ETIMEDOUT' || code === 'ECONNECTION' || command === 'CONN';
};

const sendMailWithFallback = async (mailOptions) => {
  const primary = createTransporter();

  try {
    return await primary.sendMail(mailOptions);
  } catch (error) {
    const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').toLowerCase();
    const configuredPort = parseInt(process.env.EMAIL_PORT || '465', 10);

    // Render/Gmail can intermittently timeout on 465 SSL handshake.
    // Retry once using 587 + STARTTLS when using Gmail.
    const canUseGmailFallback = host.includes('gmail') && configuredPort === 465;

    if (!canUseGmailFallback || !shouldRetryWithFallback(error)) {
      throw error;
    }

    const fallback = createTransporter({
      port: 587,
      secure: false,
      requireTLS: true,
      tls: { servername: 'smtp.gmail.com' },
    });

    return fallback.sendMail(mailOptions);
  }
};

/**
 * Send invoice email with PDF attachment.
 * @param {object} opts
 * @param {string} opts.fromEmail   - Payee email
 * @param {string} opts.fromName    - Payee name
 * @param {string} opts.toEmail     - Payer email
 * @param {string} opts.toName      - Payer name
 * @param {string} opts.subject     - Email subject
 * @param {string} opts.body        - Email body (plain text)
 * @param {string} opts.pdfBase64   - Base64 encoded PDF string
 * @param {string} opts.filename    - Attachment filename
 */
const sendInvoiceEmail = async ({ fromEmail, fromName, toEmail, toName, subject, body, pdfBase64, filename }) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.');
  }

  const mailOptions = {
    from: `"${fromName}" <${emailUser}>`,
    replyTo: fromEmail,
    to: `"${toName}" <${toEmail}>`,
    cc: fromEmail,
    subject,
    text: body,
    html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    attachments: [
      {
        filename: filename || 'invoice.pdf',
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      },
    ],
  };

  const info = await sendMailWithFallback(mailOptions);
  return info;
};

/**
 * Send email verification link to a newly registered user.
 * @param {object} opts
 * @param {string} opts.toEmail   - User's email address
 * @param {string} opts.toName    - User's display name / username
 * @param {string} opts.verifyUrl - Full URL containing the verification token
 */
const sendVerificationEmail = async ({ toEmail, toName, verifyUrl }) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.');
  }

  const mailOptions = {
    from: `"Free Tools" <${emailUser}>`,
    to: `"${toName}" <${toEmail}>`,
    subject: 'Verify your Free Tools account',
    text: `Hi ${toName},\n\nThank you for signing up!\n\nPlease verify your email address by clicking the link below:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, you can safely ignore this email.\n\n— Free Tools Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <h2 style="margin-top:0;color:#1f2937;">Verify your email address</h2>
        <p style="color:#4b5563;">Hi <strong>${toName}</strong>,</p>
        <p style="color:#4b5563;">Thanks for creating a Free Tools account! Click the button below to confirm your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Verify Email</a>
        <p style="color:#6b7280;font-size:13px;">Or copy and paste this link into your browser:<br><a href="${verifyUrl}" style="color:#4f46e5;word-break:break-all;">${verifyUrl}</a></p>
        <p style="color:#9ca3af;font-size:12px;margin-bottom:0;">This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.</p>
      </div>`,
  };

  const info = await sendMailWithFallback(mailOptions);
  return info;
};

module.exports = { sendInvoiceEmail, sendVerificationEmail };
