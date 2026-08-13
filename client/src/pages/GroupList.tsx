import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Group } from '../types';
import { Users, PlusCircle, ArrowRight, X, Sparkles } from 'lucide-react';

export const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      if (res.data?.success) setGroups(res.data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/groups', { name, description });
      if (res.data?.success) {
        setName('');
        setDescription('');
        setShowModal(false);
        fetchGroups();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Expense Groups</h1>
          <p className="text-slate-400 text-sm mt-1">Manage trips, flatmates, and shared activities</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Group</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Groups Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You haven't created or joined any expense groups yet. Create a group now to start recording expenses!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4 group shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {group.description || 'No description'}
                  </p>
                </div>
                <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                  {group.inviteCode}
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  {group.members.length} Members
                </span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  Total: ₹{(group.totalSpendingINR || 0).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal: Create Group */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Create Expense Group</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs">{error}</div>}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Goa Trip 2026 or Apartment 402"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hotel, food, fuel and activities..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-sm shadow-lg cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
