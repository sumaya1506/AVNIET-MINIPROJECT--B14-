const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production') {
    // Production: use real SMTP creds from .env
    transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  } else {
    // Development: auto-create a free Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('📧 Ethereal email account created:', testAccount.user);
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const t    = await getTransporter();
    const from = process.env.EMAIL_FROM || 'PlaceIQ <noreply@placeiq.dev>';
    const info = await t.sendMail({ from, to, subject, html });
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    // Email failure must not crash API responses
    console.error('📧 Email send error:', err.message);
  }
};

module.exports = sendEmail;
