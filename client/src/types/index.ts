export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: User | string;
  inviteCode: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
  totalSpendingINR?: number;
}

export interface Participant {
  user: User;
  amountOwed: number; // in paise
  shareValue?: number;
}

export interface Expense {
  _id: string;
  groupId: string | Group;
  description: string;
  amount: number; // in paise
  paidBy: User;
  participants: Participant[];
  splitType: 'equal' | 'exact' | 'percentage' | 'shares';
  date: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
}

export interface Settlement {
  _id: string;
  groupId: string | Group;
  fromUser: User;
  toUser: User;
  amount: number; // in paise
  status: 'completed' | 'pending';
  notes?: string;
  createdAt: string;
}

export interface UserBalance {
  userId: string;
  userName: string;
  email: string;
  totalPaid: number; // in paise
  totalShare: number; // in paise
  netBalance: number; // in paise
}

export interface SimplifiedTransaction {
  fromUser: {
    _id: string;
    name: string;
    email: string;
  };
  toUser: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number; // in paise
}

export interface GroupBalancesResponse {
  success: boolean;
  groupId: string;
  groupName: string;
  userBalances: UserBalance[];
  simplifiedTransactions: SimplifiedTransaction[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalGroups: number;
  totalExpensesCount: number;
  totalExpenseAmountPaise: number;
  totalExpenseAmountINR: number;
  totalSettlementsCount: number;
  totalSettlementAmountPaise: number;
  totalSettlementAmountINR: number;
}
