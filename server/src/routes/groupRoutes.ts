import { Router } from 'express';
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  getGroupBalances,
} from '../controllers/groupController';
import { createExpense, getGroupExpenses } from '../controllers/expenseController';
import { recordSettlement, getGroupSettlements } from '../controllers/settlementController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Protect all group endpoints
router.use(authenticateUser);

router.post('/', createGroup);
router.get('/', getUserGroups);
router.post('/join', joinGroup);

router.get('/:id', getGroupDetails);
router.post('/:id/leave', leaveGroup);
router.get('/:id/balances', getGroupBalances);

// Group Expenses
router.post('/:id/expenses', createExpense);
router.get('/:id/expenses', getGroupExpenses);

// Group Settlements
router.post('/:id/settlements', recordSettlement);
router.get('/:id/settlements', getGroupSettlements);

export default router;
