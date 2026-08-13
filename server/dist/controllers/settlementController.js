"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupSettlements = exports.recordSettlement = void 0;
const zod_1 = require("zod");
const Settlement_1 = require("../models/Settlement");
const Group_1 = require("../models/Group");
const createSettlementSchema = zod_1.z.object({
    toUser: zod_1.z.string().min(1, 'Recipient user ID is required'),
    amount: zod_1.z.number().positive('Settlement amount must be positive'),
    notes: zod_1.z.string().optional(),
});
// @route   POST /api/groups/:id/settlements
const recordSettlement = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const fromUser = req.user._id;
        const parseResult = createSettlementSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
            return;
        }
        const { toUser, amount: rawAmount, notes } = parseResult.data;
        const group = await Group_1.Group.findById(groupId);
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        const isMember = group.members.some((m) => m.toString() === fromUser.toString());
        if (!isMember) {
            res.status(403).json({ success: false, message: 'You must be a group member to record settlements' });
            return;
        }
        const amountPaise = Math.round(rawAmount * 100);
        const settlement = await Settlement_1.Settlement.create({
            groupId,
            fromUser,
            toUser,
            amount: amountPaise,
            status: 'completed',
            notes: notes || '',
        });
        const populated = await Settlement_1.Settlement.findById(settlement._id)
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email');
        res.status(201).json({
            success: true,
            message: 'Settlement recorded successfully',
            settlement: populated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error recording settlement' });
    }
};
exports.recordSettlement = recordSettlement;
// @route   GET /api/groups/:id/settlements
const getGroupSettlements = async (req, res) => {
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
        const settlements = await Settlement_1.Settlement.find({ groupId })
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            settlements,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching settlements' });
    }
};
exports.getGroupSettlements = getGroupSettlements;
