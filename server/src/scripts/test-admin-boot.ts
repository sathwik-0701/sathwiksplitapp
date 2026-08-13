import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import { connectDB } from '../config/db';
import { seedAdminUser } from '../utils/seedAdmin';
import { User } from '../models/User';

const testAdminLogin = async () => {
  try {
    await connectDB();
    await seedAdminUser();

    const adminEmail = (process.env.ADMIN_EMAIL || 'sathwikredd7701@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '123456789';

    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.passwordHash);

    console.log('\n==================================================');
    console.log('👑 ADMIN ACCOUNT VERIFICATION');
    console.log('==================================================');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Email Verified:', admin.emailVerified);
    console.log('Is Active:', admin.isActive);
    console.log('Password Match:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
    console.log('==================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error during admin verification:', err.message);
    process.exit(1);
  }
};

testAdminLogin();
