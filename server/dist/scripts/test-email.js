"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
const testBrevo = async () => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
    const recipientEmail = 'sathwikredd7701@gmail.com';
    console.log('🔍 Testing Brevo Email API...');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');
    console.log('Sender Email:', senderEmail);
    try {
        const res = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'Split Expense App', email: senderEmail },
            to: [{ email: recipientEmail }],
            subject: 'Brevo Test Verification Code: 123456',
            htmlContent: '<p>Your verification code is <strong>123456</strong></p>',
        }, {
            headers: {
                accept: 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
        });
        console.log('✅ Success! Brevo response:', res.data);
    }
    catch (err) {
        console.error('❌ Brevo API Error Status:', err.response?.status);
        console.error('❌ Brevo API Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
};
testBrevo();
