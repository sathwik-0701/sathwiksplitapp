import { Router } from 'express';
import { getCurrentUser } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateUser, getCurrentUser);

export default router;
