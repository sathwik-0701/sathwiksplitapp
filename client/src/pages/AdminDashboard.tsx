import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AdminStats } from '../types';
import { Users, Wallet, Receipt, ArrowRightLeft, ShieldCheck, Crown, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/api/admin/dashboard')
      .then((res) => {
        if (res.data?.success) setStats(res.data.stats);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Access denied or server error');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading admin statistics...</div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-rose-500/30 p-8 rounded-3xl text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">403 Forbidden</h2>
        <p className="text-rose-300 text-xs">{error}</p>
        <Link to="/dashboard" className="inline-block bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs">
          Return to User App
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Crown className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin Control Center</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">System Analytics & Platform Metrics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of users, groups, transactions, and system health.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Total System Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalUsers || 0}</div>
          <div className="flex space-x-2 text-xs">
            <span className="text-emerald-400 font-semibold">{stats?.activeUsers} Active</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-semibold">{stats?.inactiveUsers} Deactivated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Expense Groups</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalGroups || 0}</div>
          <p className="text-xs text-slate-500">Active trip ledgers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Total Volume (INR)</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            ₹{(stats?.totalExpenseAmountINR || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500">{stats?.totalExpensesCount || 0} expense records</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Settled Payments</span>
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{(stats?.totalSettlementAmountINR || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500">{stats?.totalSettlementsCount || 0} completed transfers</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-6 transition-all space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white group-hover:text-amber-400">User Management</h3>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Search users, view roles, and activate/deactivate accounts.</p>
        </Link>

        <Link
          to="/admin/groups"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-6 transition-all space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white group-hover:text-amber-400">Group Management</h3>
            <Wallet className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">View all expense groups, spending totals, and manage groups.</p>
        </Link>

        <Link
          to="/admin/expenses"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-6 transition-all space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white group-hover:text-amber-400">System Expenses</h3>
            <Receipt className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Audit all expense entries logged across the application.</p>
        </Link>
      </div>
    </div>
  );
};
