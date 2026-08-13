import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from single root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDB } from './config/db';
import { seedAdminUser } from './utils/seedAdmin';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB & Seed default admin user
  try {
    await connectDB();
    await seedAdminUser();
  } catch (error) {
    console.warn('⚠️ MongoDB initialization error:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  });
};

startServer();
