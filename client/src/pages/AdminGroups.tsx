import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Group } from '../types';
import { Wallet, Search, Trash2, Users, ArrowRight } from 'lucide-react';

export const AdminGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/admin/groups', { params: { search } });
      if (res.data?.success) setGroups(res.data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [search]);

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this group and all its expenses?')) return;
    try {
      const res = await axios.delete(`/api/admin/groups/${groupId}`);
      if (res.data?.success) fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Group Management</h1>
          <p className="text-slate-400 text-sm mt-1">Audit all platform groups, total spending, members, and invite codes.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search group name or code..."
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading groups...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Group Name</th>
                  <th className="p-4">Invite Code</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Total Spending</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {groups.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{g.name}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{g.inviteCode}</td>
                    <td className="p-4 text-slate-300">{(g.createdBy as any)?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-300">{g.members.length} members</td>
                    <td className="p-4 font-bold text-amber-400 font-mono">₹{(g.totalSpendingINR || 0).toFixed(2)}</td>
                    <td className="p-4 text-slate-400">{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteGroup(g._id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Delete Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
