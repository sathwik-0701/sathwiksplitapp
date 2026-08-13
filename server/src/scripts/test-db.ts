import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('🔍 Testing MongoDB connection with URI:', uri);

  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env file!');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Success! Connected to MongoDB Host:', conn.connection.host);
    console.log('📊 Database Name:', conn.connection.name);
    await mongoose.disconnect();
    console.log('🔒 Disconnected cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message);
    console.log('\n💡 Note: Make sure MongoDB service is running locally or supply a valid MongoDB Atlas connection string in server/.env');
    process.exit(1);
  }
};

testConnection();
