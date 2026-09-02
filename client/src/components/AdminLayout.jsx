import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  Users,
  HelpCircle,
  Database,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Server,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview & KPIs', tab: 'overview', icon: LayoutDashboard },
    { label: 'Courses & Lessons', tab: 'courses', icon: BookOpen },
    { label: 'User Directory', tab: 'users', icon: Users },
    { label: 'Q&A Moderation Desk', tab: 'qa', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen app-bg flex flex-col transition-colors duration-300">
      {/* Top Admin Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel border-b border-violet-500/20 shadow-xs backdrop-blur-md">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
                <Shield size={18} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-on-surface">CodeFlow</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* System status pills */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL Live</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Python 3.12 Engine Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-on-surface leading-tight">Admin Master</p>
                <p className="text-[10px] text-on-surface-variant font-mono leading-tight">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-ghost p-2 sm:px-3 sm:py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline font-semibold">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 pt-16 flex">
        {/* Admin Dedicated Sidebar */}
        <aside
          className={`fixed top-16 left-0 bottom-0 z-40 w-64 glass-panel border-r border-violet-500/20 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
              <Server size={14} /> Administration
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-surface-container text-on-surface-variant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30 transition-colors"
            >
              <Shield size={17} />
              <span>Platform Control</span>
            </Link>

            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/60">
                Quick Switching
              </span>
            </div>

            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <ExternalLink size={16} />
              <span>View Student Portal</span>
            </Link>
          </div>

          {/* Bottom account info */}
          <div className="p-4 border-t border-outline-variant/15 bg-surface-container/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface">Admin Account</p>
                <p className="text-[11px] text-on-surface-variant font-mono">Dedicated Session</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
