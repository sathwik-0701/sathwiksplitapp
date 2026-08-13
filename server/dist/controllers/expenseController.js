"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.getGroupExpenses = exports.createExpense = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const Expense_1 = require("../models/Expense");
const Group_1 = require("../models/Group");
const createExpenseSchema = zod_1.z.object({
    groupId: zod_1.z.string().min(1, 'Group ID is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    amount: zod_1.z.number().positive('Amount must be positive'), // Amount passed in INR or paise; server converts float INR to paise integer
    paidBy: zod_1.z.string().min(1, 'Paid by user ID is required'),
    splitType: zod_1.z.enum(['equal', 'exact', 'percentage', 'shares']).default('equal'),
    participants: zod_1.z.array(zod_1.z.object({
        user: zod_1.z.string(),
        amountOwed: zod_1.z.number().optional(),
        shareValue: zod_1.z.number().optional(),
    })).optional(),
    date: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
// @route   POST /api/groups/:id/expenses
const createExpense = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;
        const parseResult = createExpenseSchema.safeParse({ ...req.body, groupId });
        if (!parseResult.success) {
            res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
            return;
        }
        const { description, amount: rawAmount, paidBy, splitType, participants: rawParticipants, date, notes } = parseResult.data;
        const group = await Group_1.Group.findById(groupId);
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        // Authorization: Must be group member
        const isMember = group.members.some((m) => m.toString() === userId.toString());
        if (!isMember) {
            res.status(403).json({ success: false, message: 'You must be a member of this group to add expenses' });
            return;
        }
        // Convert INR amount to integer Paise (e.g., 100.50 -> 10050 paise)
        const totalAmountPaise = Math.round(rawAmount * 100);
        let calculatedParticipants = [];
        if (splitType === 'equal') {
            const memberCount = rawParticipants && rawParticipants.length > 0 ? rawParticipants.length : group.members.length;
            const targetUserIds = rawParticipants && rawParticipants.length > 0
                ? rawParticipants.map((p) => p.user)
                : group.members.map((m) => m.toString());
            const baseShare = Math.floor(totalAmountPaise / memberCount);
            let remainder = totalAmountPaise % memberCount;
            calculatedParticipants = targetUserIds.map((uId) => {
                let share = baseShare;
                if (remainder > 0) {
                    share += 1;
                    remainder -= 1;
                }
                return {
                    user: new mongoose_1.Types.ObjectId(uId),
                    amountOwed: share,
                };
            });
        }
        else if (splitType === 'exact') {
            let sum = 0;
            calculatedParticipants = (rawParticipants || []).map((p) => {
                const amtPaise = Math.round((p.amountOwed || 0) * 100);
                sum += amtPaise;
                return {
                    user: new mongoose_1.Types.ObjectId(p.user),
                    amountOwed: amtPaise,
                };
            });
            if (Math.abs(sum - totalAmountPaise) > 1) {
                res.status(400).json({ success: false, message: 'Exact split sum must equal total expense amount' });
                return;
            }
        }
        else if (splitType === 'percentage') {
            let totalPct = 0;
            calculatedParticipants = (rawParticipants || []).map((p) => {
                const pct = p.shareValue || 0;
                totalPct += pct;
                const amtPaise = Math.round((totalAmountPaise * pct) / 100);
                return {
                    user: new mongoose_1.Types.ObjectId(p.user),
                    amountOwed: amtPaise,
                    shareValue: pct,
                };
            });
            if (Math.abs(totalPct - 100) > 0.01) {
                res.status(400).json({ success: false, message: 'Percentages must sum to 100%' });
                return;
            }
        }
        else if (splitType === 'shares') {
            const totalShares = (rawParticipants || []).reduce((acc, p) => acc + (p.shareValue || 1), 0);
            calculatedParticipants = (rawParticipants || []).map((p) => {
                const shares = p.shareValue || 1;
                const amtPaise = Math.round((totalAmountPaise * shares) / totalShares);
                return {
                    user: new mongoose_1.Types.ObjectId(p.user),
                    amountOwed: amtPaise,
                    shareValue: shares,
                };
            });
        }
        const expense = await Expense_1.Expense.create({
            groupId,
            description,
            amount: totalAmountPaise,
            paidBy: new mongoose_1.Types.ObjectId(paidBy),
            participants: calculatedParticipants,
            splitType,
            date: date ? new Date(date) : new Date(),
            notes: notes || '',
            createdBy: userId,
        });
        const populatedExpense = await Expense_1.Expense.findById(expense._id)
            .populate('paidBy', 'name email')
            .populate('createdBy', 'name email')
            .populate('participants.user', 'name email');
        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            expense: populatedExpense,
        });
    }
    catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ success: false, message: 'Server error creating expense' });
    }
};
exports.createExpense = createExpense;
// @route   GET /api/groups/:id/expenses
const getGroupExpenses = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;
        const group = await Group_1.Group.findById(groupId);
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        const isMember = group.members.some((m) => m.toString() === userId.toString());
        if (!isMember && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        const expenses = await Expense_1.Expense.find({ groupId })
            .populate('paidBy', 'name email')
            .populate('createdBy', 'name email')
            .populate('participants.user', 'name email')
            .sort({ date: -1, createdAt: -1 });
        res.status(200).json({
            success: true,
            expenses,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching expenses' });
    }
};
exports.getGroupExpenses = getGroupExpenses;
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const expense = await Expense_1.Expense.findById(id);
        if (!expense) {
            res.status(404).json({ success: false, message: 'Expense not found' });
            return;
        }
        // Rule 11 & Permissions: Only expense creator, group creator, or admin can delete
        const group = await Group_1.Group.findById(expense.groupId);
        const isCreator = expense.createdBy.toString() === userId.toString();
        const isGroupAdmin = group && group.createdBy.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isCreator && !isGroupAdmin && !isAdmin) {
            res.status(403).json({ success: false, message: 'You do not have permission to delete this expense' });
            return;
        }
        await Expense_1.Expense.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting expense' });
    }
};
exports.deleteExpense = deleteExpense;
