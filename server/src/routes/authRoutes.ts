import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Rate limiter for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

router.post('/register', authLimiter, register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
