"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Strictly enforce backend authentication AND admin role for all admin routes
router.use(auth_1.authenticateUser);
router.use(auth_1.requireAdmin);
router.get('/dashboard', adminController_1.getAdminStats);
router.get('/users', adminController_1.getAdminUsers);
router.patch('/users/:id/toggle-status', adminController_1.toggleUserStatus);
router.get('/groups', adminController_1.getAdminGroups);
router.delete('/groups/:id', adminController_1.deleteAdminGroup);
router.get('/expenses', adminController_1.getAdminExpenses);
router.get('/settlements', adminController_1.getAdminSettlements);
exports.default = router;
