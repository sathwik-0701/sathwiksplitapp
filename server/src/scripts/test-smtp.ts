import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testBrevoSMTP = async () => {
  const smtpKey = process.env.BREVO_API_KEY || 'xsmtpsib-...';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';

  console.log('🔍 Testing Brevo SMTP Relay...');
  console.log('Host: smtp-relay.brevo.com:587');
  console.log('User:', senderEmail);

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: senderEmail,
      pass: smtpKey,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Split Expense App" <${senderEmail}>`,
      to: 'sathwikredd7701@gmail.com',
      subject: 'Brevo SMTP Test Verification Code: 654321',
      html: '<h2>Your OTP Code is: <span style="color:#16a34a">654321</span></h2>',
    });

    console.log('✅ Success! Email sent via Brevo SMTP:', info.messageId);
  } catch (err: any) {
    console.error('❌ Brevo SMTP Error:', err.message);
  }
};

testBrevoSMTP();
