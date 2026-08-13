import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const testAnyRecipient = async (targetEmail: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';

  console.log(`✉️ Testing real Brevo email dispatch to: ${targetEmail}`);

  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'Split Expense App', email: senderEmail },
        to: [{ email: targetEmail }],
        subject: '123987 is your Split Expense App verification code',
        htmlContent: `<p>Hello! Your verification code is: <strong>123987</strong></p>`,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    console.log(`✅ SUCCESS! Brevo sent OTP directly to ${targetEmail}. MessageId:`, res.data?.messageId);
  } catch (err: any) {
    console.error('❌ Error:', err.response?.data?.message || err.message);
  }
};

testAnyRecipient('sathwikredd7701@gmail.com');
