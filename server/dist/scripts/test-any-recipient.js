"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const testAnyRecipient = async (targetEmail) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
    console.log(`✉️ Testing real Brevo email dispatch to: ${targetEmail}`);
    try {
        const res = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'Split Expense App', email: senderEmail },
            to: [{ email: targetEmail }],
            subject: '123987 is your Split Expense App verification code',
            htmlContent: `<p>Hello! Your verification code is: <strong>123987</strong></p>`,
        }, {
            headers: {
                accept: 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
        });
        console.log(`✅ SUCCESS! Brevo sent OTP directly to ${targetEmail}. MessageId:`, res.data?.messageId);
    }
    catch (err) {
        console.error('❌ Error:', err.response?.data?.message || err.message);
    }
};
testAnyRecipient('sathwikredd7701@gmail.com');
