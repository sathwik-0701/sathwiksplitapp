import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getAdminGroups,
  deleteAdminGroup,
  getAdminExpenses,
  getAdminSettlements,
} from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Strictly enforce backend authentication AND admin role for all admin routes
router.use(authenticateUser);
router.use(requireAdmin);

router.get('/dashboard', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

router.get('/groups', getAdminGroups);
router.delete('/groups/:id', deleteAdminGroup);

router.get('/expenses', getAdminExpenses);
router.get('/settlements', getAdminSettlements);

export default router;
