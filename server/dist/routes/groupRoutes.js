"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController_1 = require("../controllers/groupController");
const expenseController_1 = require("../controllers/expenseController");
const settlementController_1 = require("../controllers/settlementController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all group endpoints
router.use(auth_1.authenticateUser);
router.post('/', groupController_1.createGroup);
router.get('/', groupController_1.getUserGroups);
router.post('/join', groupController_1.joinGroup);
router.get('/:id', groupController_1.getGroupDetails);
router.post('/:id/leave', groupController_1.leaveGroup);
router.get('/:id/balances', groupController_1.getGroupBalances);
// Group Expenses
router.post('/:id/expenses', expenseController_1.createExpense);
router.get('/:id/expenses', expenseController_1.getGroupExpenses);
// Group Settlements
router.post('/:id/settlements', settlementController_1.recordSettlement);
router.get('/:id/settlements', settlementController_1.getGroupSettlements);
exports.default = router;
