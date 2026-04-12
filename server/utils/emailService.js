const nodemailer = require('nodemailer');

const createTransporter = () => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for 587
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
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

  const transporter = createTransporter();

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

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendInvoiceEmail };
