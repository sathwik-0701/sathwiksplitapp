import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Lock, Mail, ArrowRight, ShieldCheck, Coins } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login({ email, password });
      if (res.requiresVerification) {
        navigate('/register', { state: { step: 'verify', email: res.email } });
        return;
      }

      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Column: Visual Illustration Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Wallet className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Split<span className="text-emerald-400">Wise</span>
            </span>
          </div>
        </div>

        {/* Money Illustration & Features */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Group Expense Management & Minimum Settlement</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Seamless group trip spending, simplified balances & instant settlements.
          </h2>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-lg">Integer Paise Math</div>
              <div className="text-slate-400 text-xs mt-1">Zero floating point discrepancies</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-indigo-400 font-bold text-lg">Min-Flow Algo</div>
              <div className="text-slate-400 text-xs mt-1">Solves debts in fewest transfers</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex justify-between">
          <span>© 2026 SplitWise Inc.</span>
          <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> 256-bit JWT Encryption</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-2">Sign in to manage your group expenses & balances</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sathwikredd7701 or user@example.com"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex justify-center items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              {!submitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="text-center pt-4 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
