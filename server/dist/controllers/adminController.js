"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminSettlements = exports.getAdminExpenses = exports.deleteAdminGroup = exports.getAdminGroups = exports.toggleUserStatus = exports.getAdminUsers = exports.getAdminStats = void 0;
const User_1 = require("../models/User");
const Group_1 = require("../models/Group");
const Expense_1 = require("../models/Expense");
const Settlement_1 = require("../models/Settlement");
// @route   GET /api/admin/dashboard
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments();
        const activeUsers = await User_1.User.countDocuments({ isActive: true });
        const inactiveUsers = await User_1.User.countDocuments({ isActive: false });
        const totalGroups = await Group_1.Group.countDocuments();
        const totalExpensesCount = await Expense_1.Expense.countDocuments();
        const totalSettlementsCount = await Settlement_1.Settlement.countDocuments();
        // Total expense amount calculation in paise
        const expenseAggregation = await Expense_1.Expense.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
        ]);
        const totalExpenseAmountPaise = expenseAggregation[0]?.totalAmount || 0;
        // Total settlement amount calculation in paise
        const settlementAggregation = await Settlement_1.Settlement.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
        ]);
        const totalSettlementAmountPaise = settlementAggregation[0]?.totalAmount || 0;
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalGroups,
                totalExpensesCount,
                totalExpenseAmountPaise,
                totalExpenseAmountINR: totalExpenseAmountPaise / 100,
                totalSettlementsCount,
                totalSettlementAmountPaise,
                totalSettlementAmountINR: totalSettlementAmountPaise / 100,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching admin statistics' });
    }
};
exports.getAdminStats = getAdminStats;
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
    try {
        const search = req.query.search;
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User_1.User.find(query)
            .select('-passwordHash -otp -otpExpires')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching users' });
    }
};
exports.getAdminUsers = getAdminUsers;
// @route   PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Prevent deactivating super admin
        if (user.email === (process.env.ADMIN_EMAIL || 'sathwikredd7701@gmail.com').toLowerCase()) {
            res.status(400).json({ success: false, message: 'Cannot deactivate primary system admin account' });
            return;
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({
            success: true,
            message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error toggling user status' });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// @route   GET /api/admin/groups
const getAdminGroups = async (req, res) => {
    try {
        const search = req.query.search;
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { inviteCode: { $regex: search, $options: 'i' } },
            ];
        }
        const groups = await Group_1.Group.find(query)
            .populate('createdBy', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });
        // Calculate total spending per group
        const groupsWithSpending = await Promise.all(groups.map(async (g) => {
            const aggregation = await Expense_1.Expense.aggregate([
                { $match: { groupId: g._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            const totalSpendingPaise = aggregation[0]?.total || 0;
            return {
                ...g.toObject(),
                totalSpendingPaise,
                totalSpendingINR: totalSpendingPaise / 100,
            };
        }));
        res.status(200).json({
            success: true,
            groups: groupsWithSpending,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching admin groups' });
    }
};
exports.getAdminGroups = getAdminGroups;
// @route   DELETE /api/admin/groups/:id
const deleteAdminGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group_1.Group.findById(id);
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        await Expense_1.Expense.deleteMany({ groupId: id });
        await Settlement_1.Settlement.deleteMany({ groupId: id });
        await Group_1.Group.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Group and all associated expense data deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting group' });
    }
};
exports.deleteAdminGroup = deleteAdminGroup;
// @route   GET /api/admin/expenses
const getAdminExpenses = async (req, res) => {
    try {
        const expenses = await Expense_1.Expense.find()
            .populate('groupId', 'name inviteCode')
            .populate('paidBy', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            expenses,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching admin expenses' });
    }
};
exports.getAdminExpenses = getAdminExpenses;
// @route   GET /api/admin/settlements
const getAdminSettlements = async (req, res) => {
    try {
        const settlements = await Settlement_1.Settlement.find()
            .populate('groupId', 'name inviteCode')
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            settlements,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching admin settlements' });
    }
};
exports.getAdminSettlements = getAdminSettlements;
