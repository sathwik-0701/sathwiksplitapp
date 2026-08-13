import axios from 'axios';
import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  otp?: string;
}

export const sendBrevoEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const apiKey = process.env.BREVO_API_KEY;
  const smtpUser = process.env.BREVO_SMTP_USER || 'ad0a0d001@smtp-brevo.com';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';

  if (options.otp) {
    console.log('\n================================================================');
    console.log(`🔑 VERIFICATION OTP CODE FOR ${options.to}: [ ${options.otp} ]`);
    console.log('================================================================\n');
  }

  // 1. Send via Brevo SMTP Relay
  if (apiKey) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: apiKey,
        },
      });

      const info = await transporter.sendMail({
        from: `"Split Expense App" <${senderEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent,
      });

      console.log(`✉️ REAL EMAIL SENT via Brevo SMTP to ${options.to}! MessageId: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error('⚠️ Brevo SMTP Send Error:', error.message);
    }
  }

  // 2. Try Brevo REST API v3 if key starts with xkeysib-
  if (apiKey && apiKey.startsWith('xkeysib-')) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'Split Expense App', email: senderEmail },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.htmlContent,
          textContent: options.textContent,
        },
        {
          headers: {
            accept: 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
        }
      );
      console.log(`✉️ Brevo API Email sent to ${options.to}. MessageId: ${response.data?.messageId}`);
      return true;
    } catch (error: any) {
      console.error('⚠️ Brevo REST API Error:', error?.response?.data?.message || error.message);
    }
  }

  return true;
};

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #16a34a; text-align: center;">Verify Your Account</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering with Split Expense Management App! Use the 6-digit OTP code below to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otp}</span>
      </div>
      <p>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;

  return sendBrevoEmail({
    to: email,
    subject: `${otp} is your verification code - Split Expense App`,
    htmlContent,
    textContent: `Your Split Expense App verification code is: ${otp}`,
    otp,
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #dc2626; text-align: center;">Reset Your Password</h2>
      <p>Use the 6-digit OTP code below to reset your Split Expense App password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otp}</span>
      </div>
      <p>This code is valid for 10 minutes.</p>
    </div>
  `;

  return sendBrevoEmail({
    to: email,
    subject: `Password Reset Code: ${otp} - Split Expense App`,
    htmlContent,
    textContent: `Your password reset code is: ${otp}`,
    otp,
  });
};
