import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Group } from '../types';
import { Users, PlusCircle, UserCheck, TrendingUp, TrendingDown, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/groups')
      .then((res) => {
        if (res.data?.success) setGroups(res.data.groups);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Account</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}! 👋</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Track shared trip expenses, auto-calculate equal/custom splits, and simplify group balances seamlessly.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/groups"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create / View Groups</span>
            </Link>
            <Link
              to="/join-group"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-xl border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Join via Code</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Groups Joined</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{groups.length}</div>
          <p className="text-xs text-slate-500">Active group expense ledgers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Account Status</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">Active</div>
          <p className="text-xs text-slate-500">Role: <span className="uppercase text-slate-300 font-bold">{user?.role}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Minimum Debt Engine</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">Enabled</div>
          <p className="text-xs text-slate-500">Paise integer calculations</p>
        </div>
      </div>

      {/* Groups Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your Groups ({groups.length})</h2>
          <Link to="/groups" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center">
            View All Groups <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Groups Yet</h3>
              <p className="text-slate-400 text-xs mt-1">Create a group or join an existing trip with an invite code.</p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <Link to="/groups" className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm">
                Create First Group
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                      {group.description || 'No description provided'}
                    </p>
                  </div>
                  <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                    {group.inviteCode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {group.members?.length || 0} Members
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    Total: ₹{(group.totalSpendingINR || 0).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
