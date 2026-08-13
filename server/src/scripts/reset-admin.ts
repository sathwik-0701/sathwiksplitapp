import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env file!');
    process.exit(1);
  }
  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env file!');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      existing.emailVerified = true;
      existing.isActive = true;
      await existing.save();
      console.log(`👑 Existing admin updated: ${adminEmail}`);
      console.log('   Password has been reset to the value currently in ADMIN_PASSWORD.');
    } else {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });
      console.log(`👑 New admin created: ${adminEmail}`);
    }

    await mongoose.disconnect();
    console.log('🔒 Done. You can now log in with ADMIN_EMAIL / ADMIN_PASSWORD from your .env.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

run();