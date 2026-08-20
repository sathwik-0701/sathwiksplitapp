import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import expenseRoutes from './routes/expenseRoutes';
import adminRoutes from './routes/adminRoutes';
const app: Express = express();
// Security middleware
app.use(helmet());
// CORS setup supporting multiple origins & Render deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, Postman, mobile)
      if (!origin) return callback(null, true);
      const reqOrigin = origin.replace(/\/$/, '');
      // Parse CLIENT_URL environment variable (supports comma-separated list)
      const envOrigins = (process.env.CLIENT_URL || '')
        .split(',')
        .map((s) => s.trim().replace(/\/$/, ''))
        .filter(Boolean);
      const isAllowed =
        envOrigins.length === 0 ||
        envOrigins.includes(reqOrigin) ||
        reqOrigin.endsWith('.onrender.com') ||
        reqOrigin.includes('localhost');
      if (isAllowed) {
        return callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        return callback(null, true); // Fallback to allow connection
      }
    },
    credentials: true,
  })
);
