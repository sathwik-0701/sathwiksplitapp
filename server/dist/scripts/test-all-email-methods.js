"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const key = process.env.BREVO_API_KEY;
const sender = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
const recipient = 'sathwikredd7701@gmail.com';
console.log('🔍 Diagnostics for Email Delivery to:', recipient);
console.log('Key:', key ? `${key.substring(0, 15)}...` : 'MISSING');
console.log('Sender Email:', sender);
const runTests = async () => {
    // Method 1: Brevo REST API v3
    console.log('\n--- Test Method 1: Brevo REST API v3 ---');
    try {
        const res = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'Split Expense App', email: sender },
            to: [{ email: recipient }],
            subject: 'Split Expense App - Email Verification Code: 987654',
            htmlContent: '<div style="padding:20px;font-family:sans-serif;"><h2>Your Verification Code is: <b style="color:#16a34a">987654</b></h2></div>',
        }, {
            headers: {
                accept: 'application/json',
                'api-key': key,
                'content-type': 'application/json',
            },
        });
        console.log('✅ SUCCESS via Brevo REST API! Message ID:', res.data?.messageId);
        return;
    }
    catch (err) {
        console.log('❌ Method 1 Failed:', err.response?.data?.message || err.message);
    }
    // Method 2: Brevo SMTP Port 587
    console.log('\n--- Test Method 2: Brevo SMTP Port 587 ---');
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user: sender, pass: key },
        });
        const info = await transporter.sendMail({
            from: `"Split Expense App" <${sender}>`,
            to: recipient,
            subject: 'Split Expense App - Email Verification Code: 987654',
            html: '<h2>Your Code is: 987654</h2>',
        });
        console.log('✅ SUCCESS via Brevo SMTP Port 587! Message ID:', info.messageId);
        return;
    }
    catch (err) {
        console.log('❌ Method 2 Failed:', err.message);
    }
    // Method 3: Brevo SMTP Port 465 (SSL)
    console.log('\n--- Test Method 3: Brevo SMTP Port 465 (SSL) ---');
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 465,
            secure: true,
            auth: { user: sender, pass: key },
        });
        const info = await transporter.sendMail({
            from: `"Split Expense App" <${sender}>`,
            to: recipient,
            subject: 'Split Expense App - Email Verification Code: 987654',
            html: '<h2>Your Code is: 987654</h2>',
        });
        console.log('✅ SUCCESS via Brevo SMTP Port 465! Message ID:', info.messageId);
        return;
    }
    catch (err) {
        console.log('❌ Method 3 Failed:', err.message);
    }
};
runTests();
