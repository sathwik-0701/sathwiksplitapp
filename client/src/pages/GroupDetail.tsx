import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Group, Expense, Settlement, GroupBalancesResponse } from '../types';
import {
  Users,
  PlusCircle,
  Receipt,
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  X,
  UserCheck,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balances, setBalances] = useState<GroupBalancesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'settlements' | 'members'>('expenses');

  const [copiedLink, setCopiedLink] = useState(false);

  // Add Expense Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [notes, setNotes] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Settle Up Modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleToUser, setSettleToUser] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [submittingSettle, setSubmittingSettle] = useState(false);

  const fetchGroupData = async () => {
    if (!id) return;
    try {
      const [groupRes, expRes, balRes, setRes] = await Promise.all([
        axios.get(`/api/groups/${id}`),
        axios.get(`/api/groups/${id}/expenses`),
        axios.get(`/api/groups/${id}/balances`),
        axios.get(`/api/groups/${id}/settlements`),
      ]);

      if (groupRes.data?.success) setGroup(groupRes.data.group);
      if (expRes.data?.success) setExpenses(expRes.data.expenses);
      if (balRes.data?.success) setBalances(balRes.data);
      if (setRes.data?.success) setSettlements(setRes.data.settlements);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  useEffect(() => {
    if (group && user) {
      setPaidBy(user._id);
    }
  }, [group, user]);

  const copyInviteLink = () => {
    if (!group) return;
    const url = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setExpenseError('Please enter a valid expense amount');
      return;
    }

    setSubmittingExpense(true);

    try {
      const res = await axios.post(`/api/groups/${id}/expenses`, {
        description,
        amount: parsedAmt,
        paidBy: paidBy || user?._id,
        splitType,
        notes,
      });

      if (res.data?.success) {
        setDescription('');
        setAmount('');
        setNotes('');
        setShowExpenseModal(false);
        fetchGroupData();
      }
    } catch (err: any) {
      setExpenseError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await axios.delete(`/api/expenses/${expenseId}`);
      if (res.data?.success) fetchGroupData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const openSettleModal = (txn: any) => {
    setSettleToUser(txn.toUser);
    setSettleAmount((txn.amount / 100).toFixed(2));
    setShowSettleModal(true);
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleToUser) return;
    setSubmittingSettle(true);

    try {
      const res = await axios.post(`/api/groups/${id}/settlements`, {
        toUser: settleToUser._id,
        amount: parseFloat(settleAmount),
      });

      if (res.data?.success) {
        setShowSettleModal(false);
        fetchGroupData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setSubmittingSettle(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading group details...</div>;
  }

  if (!group) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Group Not Found</h2>
        <button onClick={() => navigate('/groups')} className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm">
          Return to Groups
        </button>
      </div>
    );
  }

  const totalGroupSpendingPaise = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGroupSpendingINR = (totalGroupSpendingPaise / 100).toFixed(2);

  const userPaidPaise = expenses
    .filter((exp) => (typeof exp.paidBy === 'object' ? exp.paidBy?._id : exp.paidBy) === user?._id)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const userPaidINR = (userPaidPaise / 100).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-white">{group.name}</h1>
              <span className="bg-slate-800 text-slate-300 font-mono text-xs px-3 py-1 rounded-lg border border-slate-700">
                Code: {group.inviteCode}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{group.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={copyInviteLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs sm:text-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span className="truncate">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Spending Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Group Spending</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">₹{totalGroupSpendingINR}</div>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Expenses</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">{expenses.length} Logged</div>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">You Have Paid</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">₹{userPaidINR}</div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 space-x-2 sm:space-x-6 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'expenses'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('balances')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'balances'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Balances & Debt</span>
          </button>

          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'settlements'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Settlements ({settlements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'members'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({group.members.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Expenses Feed */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Receipt className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Expenses Yet</h3>
              <p className="text-slate-400 text-xs">Add your first expense to auto-calculate shared balances.</p>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Add Expense
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {expenses.map((exp) => (
                <div
                  key={exp._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 font-bold text-lg">
                      ₹{(exp.amount / 100).toFixed(2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{exp.description}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Paid by <strong className="text-slate-200">{exp.paidBy?.name || 'Member'}</strong></span>
                        <span>•</span>
                        <span className="capitalize px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">
                          Split: {exp.splitType}
                        </span>
                        <span>•</span>
                        <span>{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-xs text-slate-400">
                      <div>Participants: {exp.participants.length}</div>
                      <div className="text-emerald-400 font-mono">₹{((exp.amount / exp.participants.length) / 100).toFixed(2)} / person</div>
                    </div>
                    {(exp.createdBy?._id === user?._id || group.createdBy === user?._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Balances & Debt Simplification */}
      {activeTab === 'balances' && balances && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Net Balances List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-emerald-400" />
              Member Net Balances
            </h2>

            <div className="space-y-3">
              {balances.userBalances.map((b) => {
                const netINR = b.netBalance / 100;
                const isOwed = netINR > 0;
                const isOwes = netINR < 0;

                return (
                  <div key={b.userId} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">{b.userName}</div>
                      <div className="text-xs text-slate-400">Total Paid: ₹{(b.totalPaid / 100).toFixed(2)}</div>
                    </div>

                    <div className="text-right">
                      {isOwed && <div className="text-emerald-400 font-bold text-sm">gets back ₹{netINR.toFixed(2)}</div>}
                      {isOwes && <div className="text-rose-400 font-bold text-sm">owes ₹{Math.abs(netINR).toFixed(2)}</div>}
                      {!isOwed && !isOwes && <div className="text-slate-400 font-bold text-sm">Settled Up</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simplified Minimum Debt Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
              Simplified Debt Transfers
            </h2>

            {balances.simplifiedTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">All group members are fully settled! 🎉</div>
            ) : (
              <div className="space-y-4">
                {balances.simplifiedTransactions.map((txn, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>
                        <strong className="text-rose-300">{txn.fromUser.name}</strong> pays{' '}
                        <strong className="text-emerald-300">{txn.toUser.name}</strong>
                      </div>
                      <div className="font-mono text-emerald-400 font-bold text-base">₹{(txn.amount / 100).toFixed(2)}</div>
                    </div>

                    {txn.fromUser._id === user?._id && (
                      <button
                        onClick={() => openSettleModal(txn)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow cursor-pointer"
                      >
                        Settle Up
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Settlements Log */}
      {activeTab === 'settlements' && (
        <div className="space-y-4">
          {settlements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
              No settlements recorded yet. Use "Settle Up" in Balances to record payments.
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((s) => (
                <div key={s._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white font-medium">
                      <strong className="text-emerald-400">{s.fromUser?.name}</strong> paid <strong className="text-indigo-400">{s.toUser?.name}</strong>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold text-base">₹{(s.amount / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Members */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {group.members.map((m) => (
            <div key={m._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{m.name}</div>
                <div className="text-xs text-slate-400">{m.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add Group Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {expenseError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs">{expenseError}</div>}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Hotel Booking, Dinner, Fuel"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount (INR ₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 4000"
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-lg rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m._id === user?._id ? 'You' : m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Split Strategy</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="equal">Equal Split (Split equally among members)</option>
                  <option value="exact">Exact Amount (Custom exact ₹ per member)</option>
                  <option value="percentage">Percentage (Custom % share)</option>
                  <option value="shares">Shares (Custom share ratio)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-sm cursor-pointer"
                >
                  {submittingExpense ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settle Up */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Record Payment / Settle Up</h2>
              <button onClick={() => setShowSettleModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <p className="text-xs text-slate-300">
                Recording payment from <strong>You</strong> to <strong className="text-emerald-400">{settleToUser?.name}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount Paid (INR ₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xl font-bold rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSettle}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-sm cursor-pointer"
                >
                  {submittingSettle ? 'Recording...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
