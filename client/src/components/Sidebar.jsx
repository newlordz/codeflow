import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Brain,
  Award,
  StickyNote,
  Bell,
  MessageCircle,
  X,
  Shield,
  Plus,
  Trophy,
  Swords,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import ProgressBar from './ProgressBar';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/battles', label: 'Code Battles', icon: Swords },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/playground', label: 'Code Playground', icon: Code2 },
  { to: '/quizzes', label: 'Quizzes', icon: Brain },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/qa', label: 'Q&A', icon: MessageCircle },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const { get } = useApi();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    async function fetchEnrolled() {
      try {
        const data = await get('/courses');
        const list = Array.isArray(data) ? data : data?.courses || [];
        setEnrolledCourses(list.filter((c) => Boolean(c.enrolled)));
      } catch {
        setEnrolledCourses([]);
      }
    }
    fetchEnrolled();
  }, [get]);

  const navItems = baseNavItems;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 glass-panel border-r border-outline-variant/30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-outline-variant/20">
          <span className="text-on-surface font-semibold text-sm">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Real Enrolled Courses */}
        <div className="p-4 border-t border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
              My Courses ({enrolledCourses.length})
            </p>
            <Link
              to="/courses"
              onClick={onClose}
              className="text-primary hover:text-primary/80"
              title="Add Course"
            >
              <Plus size={14} />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="py-2">
              <p className="text-[11px] text-on-surface-variant/60 font-mono">No courses enrolled yet</p>
              <Link
                to="/courses"
                onClick={onClose}
                className="text-xs font-semibold text-primary hover:underline mt-1 inline-block"
              >
                + Select a course
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
              {enrolledCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  onClick={onClose}
                  className="block space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface group-hover:text-primary transition-colors truncate flex-1 mr-2">
                      {course.title}
                    </span>
                    <span className="text-[10px] text-primary font-mono font-semibold">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <ProgressBar value={course.progress || 0} color="primary" size="xs" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user?.username?.slice(0, 2).toUpperCase() || 'CF'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-on-surface font-semibold truncate">{user?.username}</p>
                {user?.role === 'admin' && (
                  <span className="text-[9px] font-mono font-bold text-violet-600 bg-violet-500/10 px-1 py-0.2 rounded">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] text-on-surface-variant font-mono truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
