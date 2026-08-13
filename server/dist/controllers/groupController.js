"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupBalances = exports.leaveGroup = exports.joinGroup = exports.getGroupDetails = exports.getUserGroups = exports.createGroup = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const Group_1 = require("../models/Group");
const Expense_1 = require("../models/Expense");
const Settlement_1 = require("../models/Settlement");
const balanceCalculator_1 = require("../utils/balanceCalculator");
// Helper to generate 8-character unique alphanumeric invite code (e.g. GOAT1234)
const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
const createGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Group name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
});
const joinGroupSchema = zod_1.z.object({
    inviteCode: zod_1.z.string().min(1, 'Invite code is required'),
});
// @route   POST /api/groups
const createGroup = async (req, res) => {
    try {
        const parseResult = createGroupSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
            return;
        }
        const { name, description } = parseResult.data;
        const userId = req.user._id;
        let inviteCode = generateInviteCode();
        let isUnique = false;
        while (!isUnique) {
            const existing = await Group_1.Group.findOne({ inviteCode });
            if (!existing)
                isUnique = true;
            else
                inviteCode = generateInviteCode();
        }
        const group = await Group_1.Group.create({
            name,
            description: description || '',
            createdBy: userId,
            inviteCode,
            members: [userId],
        });
        const populatedGroup = await Group_1.Group.findById(group._id).populate('members', 'name email');
        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            group: populatedGroup,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error creating group' });
    }
};
exports.createGroup = createGroup;
// @route   GET /api/groups
const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group_1.Group.find({ members: userId })
            .populate('members', 'name email')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });
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
        res.status(500).json({ success: false, message: 'Server error fetching groups' });
    }
};
exports.getUserGroups = getUserGroups;
// @route   GET /api/groups/:id
const getGroupDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: 'Invalid Group ID' });
            return;
        }
        const group = await Group_1.Group.findById(id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email');
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        // Authorization Rule 1: User must belong to the group
        const isMember = group.members.some((m) => m._id.toString() === userId.toString());
        if (!isMember && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'You are not a member of this group' });
            return;
        }
        res.status(200).json({
            success: true,
            group,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching group details' });
    }
};
exports.getGroupDetails = getGroupDetails;
// @route   POST /api/groups/join
const joinGroup = async (req, res) => {
    try {
        const parseResult = joinGroupSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
            return;
        }
        const inviteCode = parseResult.data.inviteCode.toUpperCase().trim();
        const userId = req.user._id;
        const group = await Group_1.Group.findOne({ inviteCode });
        if (!group) {
            res.status(404).json({ success: false, message: 'Invalid invite code or group not found' });
            return;
        }
        const alreadyMember = group.members.some((m) => m.toString() === userId.toString());
        if (alreadyMember) {
            res.status(400).json({ success: false, message: 'You are already a member of this group' });
            return;
        }
        group.members.push(userId);
        await group.save();
        const populatedGroup = await Group_1.Group.findById(group._id).populate('members', 'name email');
        res.status(200).json({
            success: true,
            message: `Successfully joined ${group.name}!`,
            group: populatedGroup,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error joining group' });
    }
};
exports.joinGroup = joinGroup;
// @route   POST /api/groups/:id/leave
const leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const group = await Group_1.Group.findById(id);
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        const isMember = group.members.some((m) => m.toString() === userId.toString());
        if (!isMember) {
            res.status(400).json({ success: false, message: 'You are not a member of this group' });
            return;
        }
        // Remove user from members
        group.members = group.members.filter((m) => m.toString() !== userId.toString());
        await group.save();
        res.status(200).json({
            success: true,
            message: 'You have left the group',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error leaving group' });
    }
};
exports.leaveGroup = leaveGroup;
// @route   GET /api/groups/:id/balances
const getGroupBalances = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const group = await Group_1.Group.findById(id).populate('members', 'name email');
        if (!group) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }
        const isMember = group.members.some((m) => m._id.toString() === userId.toString());
        if (!isMember && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        const expenses = await Expense_1.Expense.find({ groupId: id });
        const settlements = await Settlement_1.Settlement.find({ groupId: id });
        const balanceData = (0, balanceCalculator_1.calculateGroupBalances)(group.members, expenses, settlements);
        res.status(200).json({
            success: true,
            groupId: group._id,
            groupName: group.name,
            userBalances: balanceData.userBalances,
            simplifiedTransactions: balanceData.simplifiedTransactions,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error calculating balances' });
    }
};
exports.getGroupBalances = getGroupBalances;
