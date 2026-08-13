import { Router } from 'express';
import { deleteExpense } from '../controllers/expenseController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.delete('/:id', deleteExpense);

export default router;
