import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Flame,
  BookOpen,
  Award,
  Sparkles,
  Info,
  MessageCircle,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

const typeIcons = {
  streak: Flame,
  course: BookOpen,
  certificate: Award,
  motivation: Sparkles,
  quiz: Info,
  info: Info,
  qa: MessageCircle,
};

const typeColors = {
  streak: 'text-tertiary',
  course: 'text-primary',
  certificate: 'text-secondary',
  motivation: 'text-secondary',
  quiz: 'text-primary',
  info: 'text-on-surface-variant',
  qa: 'text-primary',
};

const fallbackNotifications = [
  { id: 1, title: 'Daily Streak!', message: 'You are on fire! 7-day streak achieved.', type: 'streak', read: false, created_at: new Date().toISOString() },
  { id: 2, title: 'Course Progress', message: 'You have completed 35% of Python Mastery!', type: 'course', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, title: 'Certificate Earned!', message: 'Congratulations! You earned a certificate for Python Fundamentals.', type: 'certificate', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, title: 'Keep Going!', message: 'Every expert was once a beginner. Keep pushing forward!', type: 'motivation', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
];

export default function Notifications() {
  const { get, put, post } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await get('/notifications');
      const list = data?.notifications || (Array.isArray(data) ? data : fallbackNotifications);
      setNotifications(list);
      const unread = list.filter((n) => !n.read).length;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: unread } }));
    } catch {
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      const newUnread = updated.filter((n) => !n.read).length;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: newUnread } }));
      return updated;
    });

    try {
      await put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read on server:', err);
    }
  };

  const handleMarkAllRead = async () => {
    // 1. Instantly mark all as read in local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // 2. Instantly clear unread count in navbar
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: 0 } }));
    toast.success('All notifications marked as read', { icon: '✓' });

    // 3. Persist to server
    try {
      await post('/notifications/mark-all-read');
    } catch (err) {
      console.error('Failed to mark all read on server:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach((item) => {
      const d = new Date(item.created_at);
      const now = new Date();
      const diff = now - d;
      let key;
      if (diff < 86400000) key = 'Today';
      else if (diff < 172800000) key = 'Yesterday';
      else key = 'Older';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-xl p-5 shimmer h-20" />
        ))}
      </div>
    );
  }

  const grouped = groupByDate(notifications);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">Notifications</h1>
          <div className="flex items-center gap-2">
            <p className="text-on-surface-variant text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
            {unreadCount === 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                ✓ All Read
              </span>
            )}
          </div>
        </div>
        {unreadCount > 0 ? (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 text-sm btn-primary rounded-xl transition-all shadow-xs"
          >
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium px-3 py-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-xl">
            <CheckCheck size={14} className="text-emerald-400" />
            <span>All read</span>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
          <p className="text-on-surface-variant">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 font-mono">
                {group}
              </h3>
              <div className="space-y-2">
                {items.map((notif, i) => {
                  const Icon = typeIcons[notif.type] || Info;
                  const iconColor = typeColors[notif.type] || 'text-primary';
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                      className={`cursor-pointer ${!notif.read ? '' : ''}`}
                    >
                      <GlassPanel
                        className={`p-4 transition-all duration-300 ${
                          !notif.read
                            ? 'border-primary/20 bg-primary/[0.02]'
                            : ''
                        }`}
                        hover
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-on-surface">
                                {notif.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {!notif.read && (
                                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                                <span className="text-[10px] text-on-surface-variant/60 font-mono">
                                  {formatDate(notif.created_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
