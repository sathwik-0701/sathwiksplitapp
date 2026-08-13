import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '../types';
import { Users, Search, ToggleLeft, ToggleRight, ShieldCheck, Mail, Calendar, Crown } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', { params: { search } });
      if (res.data?.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await axios.patch(`/api/admin/users/${userId}/toggle-status`);
      if (res.data?.success) fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Audit users, roles, email verification status, and toggle activity.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{u.name}</div>
                        <div className="text-slate-400 text-xs">{u.email}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          <Crown className="w-3 h-3" />
                          <span>ADMIN</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          USER
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.emailVerified ? (
                        <span className="text-emerald-400 font-semibold flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Pending OTP</span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                          u.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
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
