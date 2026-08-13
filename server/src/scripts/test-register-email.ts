import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const smtpUser = process.env.BREVO_SMTP_USER || 'ad0a0d001@smtp-brevo.com';
const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
const recipientEmail = 'psrpsr1432@gmail.com';

console.log('🔍 Testing Brevo SMTP send to:', recipientEmail);
console.log('SMTP User:', smtpUser);
console.log('Sender Email:', senderEmail);

const testRealEmailSend = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: apiKey,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Split Expense App" <${senderEmail}>`,
      to: recipientEmail,
      subject: '984123 is your Split Expense App verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #16a34a; text-align: center;">Verify Your Account</h2>
          <p>Hello <strong>User</strong>,</p>
          <p>Thank you for registering with Split Expense Management App! Use the 6-digit OTP code below to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">984123</span>
          </div>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log('🎉 SUCCESS! Email dispatched by Brevo SMTP to:', recipientEmail);
    console.log('Message ID:', info.messageId);
    console.log('Accepted by Brevo:', info.accepted);
    console.log('Rejected by Brevo:', info.rejected);
  } catch (err: any) {
    console.error('❌ Brevo Send Failed:', err.message);
  }
};

testRealEmailSend();
