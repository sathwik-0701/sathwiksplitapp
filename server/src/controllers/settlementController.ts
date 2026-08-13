import { Response } from 'express';
import { z } from 'zod';
import { Settlement } from '../models/Settlement';
import { Group } from '../models/Group';
import { AuthRequest } from '../middleware/auth';

const createSettlementSchema = z.object({
  toUser: z.string().min(1, 'Recipient user ID is required'),
  amount: z.number().positive('Settlement amount must be positive'),
  notes: z.string().optional(),
});

// @route   POST /api/groups/:id/settlements
export const recordSettlement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: groupId } = req.params;
    const fromUser = req.user!._id;

    const parseResult = createSettlementSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { toUser, amount: rawAmount, notes } = parseResult.data;

    const group = await Group.findById(groupId);
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

    const settlement = await Settlement.create({
      groupId,
      fromUser,
      toUser,
      amount: amountPaise,
      status: 'completed',
      notes: notes || '',
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      settlement: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error recording settlement' });
  }
};

// @route   GET /api/groups/:id/settlements
export const getGroupSettlements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user!._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const settlements = await Settlement.find({ groupId })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      settlements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching settlements' });
  }
};
