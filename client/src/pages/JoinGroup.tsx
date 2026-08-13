import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export const JoinGroup: React.FC = () => {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [inviteCode, setInviteCode] = useState(paramCode || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (paramCode) {
      setInviteCode(paramCode.toUpperCase());
    }
  }, [paramCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/groups/join', { inviteCode });
      if (res.data?.success) {
        setSuccess(res.data.message);
        setTimeout(() => {
          navigate(`/groups/${res.data.group._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Join Expense Group</h1>
          <p className="text-slate-400 text-xs mt-1">Enter your group's unique 8-character invite code</p>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Invite Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                required
                maxLength={8}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCD1234"
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono tracking-widest text-lg font-bold rounded-xl pl-12 pr-4 py-3 focus:border-emerald-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center space-x-2 transition-all cursor-pointer"
          >
            <span>{submitting ? 'Joining...' : 'Join Group'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
          Invite codes can be obtained from the group creator or group members hub.
        </div>
      </div>
    </div>
  );
};
