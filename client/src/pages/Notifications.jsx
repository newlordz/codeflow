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
      setNotifications(data.notifications || data || fallbackNotifications);
    } catch {
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
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
          <p className="text-on-surface-variant text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 text-sm glass-panel text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
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
