import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const testBrevo = async () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
  const recipientEmail = 'sathwikredd7701@gmail.com';

  console.log('🔍 Testing Brevo Email API...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');
  console.log('Sender Email:', senderEmail);

  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'Split Expense App', email: senderEmail },
        to: [{ email: recipientEmail }],
        subject: 'Brevo Test Verification Code: 123456',
        htmlContent: '<p>Your verification code is <strong>123456</strong></p>',
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    console.log('✅ Success! Brevo response:', res.data);
  } catch (err: any) {
    console.error('❌ Brevo API Error Status:', err.response?.status);
    console.error('❌ Brevo API Error Data:', JSON.stringify(err.response?.data, null, 2));
  }
};

testBrevo();
