"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const smtpLogin = 'ad0a0d001@smtp-brevo.com';
const smtpPass = 'xsmtpsib-eadd237017f944e14bddff5a98b5e06a54159434737153d518f1795e02e12452-OgK78ID9LuN3f4gk';
const senderEmail = 'sathwikredd7701@gmail.com';
const recipientEmail = 'sathwikredd7701@gmail.com';
console.log('🔍 Testing Brevo SMTP with Login Username:', smtpLogin);
const testSMTP = async () => {
    const transporter = nodemailer_1.default.createTransport({
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
            subject: 'Split Expense App - Email Verification Code: 482915',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #16a34a; text-align: center;">Verify Your Account</h2>
          <p>Hello <strong>Sathwik</strong>,</p>
          <p>Thank you for registering with Split Expense Management App! Use the 6-digit OTP code below to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">482915</span>
          </div>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
        });
        console.log('🎉 SUCCESS! Real email sent to inbox via Brevo SMTP!');
        console.log('Message ID:', info.messageId);
    }
    catch (err) {
        console.error('❌ Error:', err.message);
    }
};
testSMTP();
