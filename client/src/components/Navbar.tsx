import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  Users,
  PlusCircle,
  UserCheck,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Receipt,
  ArrowRightLeft,
  Crown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner if user is Admin */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 px-4 py-1 text-xs text-slate-950 font-bold flex justify-between items-center shadow-inner">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-slate-950" />
            <span>Administrator Privileges Active</span>
          </div>
          <div className="flex space-x-3">
            <Link
              to={isAdminPage ? '/dashboard' : '/admin/dashboard'}
              className="underline hover:text-white transition-colors"
            >
              {isAdminPage ? '← Switch to User App' : '⚡ Open Admin Dashboard'}
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAdminPage ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center space-x-3 group"
          >
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group-hover:bg-emerald-500/20 transition-all">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Split<span className="text-emerald-400">Wise</span>
              {isAdminPage && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">ADMIN</span>}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isAdminPage ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/groups"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/groups'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>My Groups</span>
                </Link>

                <Link
                  to="/join-group"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/join-group'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Join Group</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>

                <Link
                  to="/admin/users"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin/users'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>

                <Link
                  to="/admin/groups"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin/groups'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Groups</span>
                </Link>

                <Link
                  to="/admin/expenses"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin/expenses'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Expenses</span>
                </Link>

                <Link
                  to="/admin/settlements"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin/settlements'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Settlements</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] sm:text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-white max-w-[90px] sm:max-w-none truncate">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Appears on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 flex justify-around items-center">
        {!isAdminPage ? (
          <>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-medium transition-colors ${
                location.pathname === '/dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/groups"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-medium transition-colors ${
                location.pathname === '/groups' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Groups</span>
            </Link>

            <Link
              to="/join-group"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-medium transition-colors ${
                location.pathname === '/join-group' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Join</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-bold text-amber-400"
              >
                <Crown className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              to="/admin/dashboard"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-bold ${
                location.pathname === '/admin/dashboard' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/admin/users"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-bold ${
                location.pathname === '/admin/users' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>

            <Link
              to="/admin/groups"
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-bold ${
                location.pathname === '/admin/groups' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Groups</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex flex-col items-center space-y-1 p-1 rounded-lg text-[10px] font-semibold text-emerald-400"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>User Mode</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
