import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'sathwikredd7701@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '123456789';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });

      console.log(`👑 Default Admin user created: ${adminEmail}`);
    } else {
      // Ensure admin has role 'admin', emailVerified, and updated password if needed
      let updated = false;
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        updated = true;
      }
      if (!existingAdmin.emailVerified) {
        existingAdmin.emailVerified = true;
        updated = true;
      }
      if (!existingAdmin.isActive) {
        existingAdmin.isActive = true;
        updated = true;
      }

      if (updated) {
        await existingAdmin.save();
        console.log(`👑 Admin permissions updated for: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error('⚠️ Error seeding admin user:', error);
  }
};
