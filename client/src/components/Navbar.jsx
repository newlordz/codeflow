import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Menu,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import ThemeToggle from './ThemeToggle';
import StreakBadge from './StreakBadge';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { get } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const data = await get('/notifications');
        const count = typeof data?.unreadCount === 'number'
          ? data.unreadCount
          : (data?.notifications || []).filter((n) => !n.read).length;
        setNotifCount(count);
      } catch {
        setNotifCount(0);
      }
    }

    if (user) {
      fetchUnreadCount();
    }

    const handleNotifsUpdated = (event) => {
      if (typeof event.detail?.count === 'number') {
        setNotifCount(event.detail.count);
      } else {
        fetchUnreadCount();
      }
    };

    window.addEventListener('notifications-updated', handleNotifsUpdated);
    return () => window.removeEventListener('notifications-updated', handleNotifsUpdated);
  }, [get, user, location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel border-b border-outline-variant/30 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xs font-mono">{'</>'}</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Code</span>
              <span className="text-on-surface">Flow</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-surface-container/70 border border-outline-variant/40 rounded-full p-1 shadow-inner">
          {[
            { to: '/courses', label: 'Courses' },
            { to: '/battles', label: 'Battles' },
            { to: '/leaderboard', label: 'Leaderboard' },
            { to: '/playground', label: 'Playground' },
            { to: '/quizzes', label: 'Quizzes' },
            { to: '/notes', label: 'Notes' },
          ].map((link) => {
            const active = window.location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <StreakBadge count={user?.streak || 0} size="sm" />

          <Link
            to="/notifications"
            className="relative p-2 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-container-high transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-primary/30 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-on-primary font-semibold text-xs">
                  {initials}
                </div>
              )}
              <ChevronDown
                size={14}
                className={`text-on-surface-variant transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass-panel rounded-lg overflow-hidden shadow-xl"
                >
                  <div className="p-3 border-b border-outline-variant/20">
                    <p className="text-on-surface font-medium text-sm">{user?.username}</p>
                    <p className="text-on-surface-variant text-xs">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-500/10 rounded-md transition-colors"
                      >
                        <Shield size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
