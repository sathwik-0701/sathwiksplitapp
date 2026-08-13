import { Response } from 'express';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Expense } from '../models/Expense';
import { Settlement } from '../models/Settlement';
import { AuthRequest } from '../middleware/auth';

// @route   GET /api/admin/dashboard
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const totalGroups = await Group.countDocuments();
    const totalExpensesCount = await Expense.countDocuments();
    const totalSettlementsCount = await Settlement.countDocuments();

    // Total expense amount calculation in paise
    const expenseAggregation = await Expense.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalExpenseAmountPaise = expenseAggregation[0]?.totalAmount || 0;

    // Total settlement amount calculation in paise
    const settlementAggregation = await Settlement.aggregate([
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admin statistics' });
  }
};

// @route   GET /api/admin/users
export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// @route   PATCH /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling user status' });
  }
};

// @route   GET /api/admin/groups
export const getAdminGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { inviteCode: { $regex: search, $options: 'i' } },
      ];
    }

    const groups = await Group.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

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
    res.status(500).json({ success: false, message: 'Server error fetching admin groups' });
  }
};

// @route   DELETE /api/admin/groups/:id
export const deleteAdminGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    await Expense.deleteMany({ groupId: id });
    await Settlement.deleteMany({ groupId: id });
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Group and all associated expense data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting group' });
  }
};

// @route   GET /api/admin/expenses
export const getAdminExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find()
      .populate('groupId', 'name inviteCode')
      .populate('paidBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admin expenses' });
  }
};

// @route   GET /api/admin/settlements
export const getAdminSettlements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settlements = await Settlement.find()
      .populate('groupId', 'name inviteCode')
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      settlements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admin settlements' });
  }
};
