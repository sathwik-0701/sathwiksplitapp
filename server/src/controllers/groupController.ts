import { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Group } from '../models/Group';
import { Expense } from '../models/Expense';
import { Settlement } from '../models/Settlement';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { calculateGroupBalances } from '../utils/balanceCalculator';

// Helper to generate 8-character unique alphanumeric invite code (e.g. GOAT1234)
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional(),
});

const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

// @route   POST /api/groups
export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createGroupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { name, description } = parseResult.data;
    const userId = req.user!._id;

    let inviteCode = generateInviteCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Group.findOne({ inviteCode });
      if (!existing) isUnique = true;
      else inviteCode = generateInviteCode();
    }

    const group = await Group.create({
      name,
      description: description || '',
      createdBy: userId,
      inviteCode,
      members: [userId],
    });

    const populatedGroup = await Group.findById(group._id).populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating group' });
  }
};

// @route   GET /api/groups
export const getUserGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const groups = await Group.find({ members: userId })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    // Calculate total spending per group
    const groupsWithSpending = await Promise.all(
      groups.map(async (g) => {
        const aggregation = await Expense.aggregate([
          { $match: { groupId: g._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalSpendingPaise = aggregation[0]?.total || 0;
        return {
          ...g.toObject(),
          totalSpendingPaise,
          totalSpendingINR: totalSpendingPaise / 100,
        };
      })
    );

    res.status(200).json({
      success: true,
      groups: groupsWithSpending,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching groups' });
  }
};

// @route   GET /api/groups/:id
export const getGroupDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid Group ID' });
      return;
    }

    const group = await Group.findById(id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    // Authorization Rule 1: User must belong to the group
    const isMember = group.members.some((m: any) => m._id.toString() === userId.toString());
    if (!isMember && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You are not a member of this group' });
      return;
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching group details' });
  }
};

// @route   POST /api/groups/join
export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = joinGroupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const inviteCode = parseResult.data.inviteCode.toUpperCase().trim();
    const userId = req.user!._id;

    const group = await Group.findOne({ inviteCode });

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

    const populatedGroup = await Group.findById(group._id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: `Successfully joined ${group.name}!`,
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error joining group' });
  }
};

// @route   POST /api/groups/:id/leave
export const leaveGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(id);
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error leaving group' });
  }
};

// @route   GET /api/groups/:id/balances
export const getGroupBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(id).populate('members', 'name email');
    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    const isMember = group.members.some((m: any) => m._id.toString() === userId.toString());
    if (!isMember && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const expenses = await Expense.find({ groupId: id });
    const settlements = await Settlement.find({ groupId: id });

    const balanceData = calculateGroupBalances(
      group.members as any,
      expenses,
      settlements
    );

    res.status(200).json({
      success: true,
      groupId: group._id,
      groupName: group.name,
      userBalances: balanceData.userBalances,
      simplifiedTransactions: balanceData.simplifiedTransactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error calculating balances' });
  }
};
