import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const smtpLogin = process.env.BREVO_SMTP_USER || 'ad0a0d001@smtp-brevo.com';
const smtpPass = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
const recipientEmail = 'sathwikredd7701@gmail.com';

const testSMTP = async () => {
  if (!smtpPass) {
    console.error('BREVO_API_KEY is not defined in .env');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpLogin,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Split Expense App" <${senderEmail}>`,
      to: recipientEmail,
      subject: 'Split Expense App - Test Verification Code',
      html: '<h2>Your Test Verification Code is active</h2>',
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  }
};

testSMTP();
