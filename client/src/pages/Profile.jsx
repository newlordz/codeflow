import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Shield,
  Key,
  Flame,
  Zap,
  Award,
  BookOpen,
  Calendar,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { put } = useApi();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings' | 'preferences'

  // Profile fields
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'CF';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await put('/auth/me', { username, bio });
      setUser((prev) => ({ ...prev, ...updated }));
      localStorage.setItem('codeflow-user', JSON.stringify({ ...user, ...updated }));
      toast.success('Profile updated successfully!', { icon: '✨' });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!', { icon: '🔒' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-16 max-w-5xl mx-auto"
    >
      {/* Top Banner Card */}
      <div className="glass-panel shadow-premium rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(77,142,255,0.15), transparent 70%)' }} />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/25 flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface display-tight">
                {user?.username || 'Developer'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                user?.role === 'admin'
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'Student Learner'}
              </span>
            </div>

            <p className="text-sm text-on-surface-variant font-mono mb-4">{user?.email}</p>

            <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
              {user?.bio || 'No bio written yet. Share your coding goals, favorite languages, and achievements!'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6 text-sm font-semibold">
        {[
          { key: 'profile', label: 'Profile Overview', icon: User },
          { key: 'settings', label: 'Account & Security', icon: Settings },
          { key: 'preferences', label: 'Preferences', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-3 transition-colors relative ${
              activeTab === tab.key
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="profile-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE OVERVIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Milestone Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-on-surface-variant">Daily Streak</span>
                <Flame size={18} className="text-amber-500" />
              </div>
              <p className="text-3xl font-bold font-mono text-on-surface">{user?.streak || 0} <span className="text-xs font-normal text-on-surface-variant">days</span></p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Best: {user?.longest_streak || user?.streak || 0}d</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-on-surface-variant">Experience</span>
                <Zap size={18} className="text-primary" />
              </div>
              <p className="text-3xl font-bold font-mono text-on-surface">{user?.xp || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">XP Points</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-on-surface-variant">Role</span>
                <Shield size={18} className="text-violet-500" />
              </div>
              <p className="text-2xl font-bold capitalize text-on-surface">{user?.role || 'Student'}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Access Level</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-on-surface-variant">Joined</span>
                <Calendar size={18} className="text-emerald-500" />
              </div>
              <p className="text-base font-bold font-mono text-on-surface">
                {user?.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'August 2026'}
              </p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Member Date</p>
            </GlassPanel>
          </div>

          {/* Edit Profile Form */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-4">Edit Profile Info</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  Display Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-premium px-4 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  About You / Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other developers about your programming interests..."
                  rows={4}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3.5 text-sm text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary px-6 py-2.5 text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT & SECURITY */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Email Info */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-base font-bold text-on-surface mb-2">Account Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                  Registered Email Address
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-premium px-3.5 py-2 text-sm opacity-70 cursor-not-allowed bg-surface-container"
                  />
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <Key size={18} className="text-primary" />
              Change Password
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="input-premium pl-4 pr-11 py-2.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input-premium pl-4 pr-11 py-2.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="input-premium px-4 py-2.5 text-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary px-6 py-2.5 text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Lock size={14} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-7 rounded-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-2">Display & Theme</h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Customize the look and feel of your CodeFlow workspace.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sun size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Light Theme</p>
                  <p className="text-xs text-on-surface-variant">Crisp clean white background</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Moon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Dark Theme</p>
                  <p className="text-xs text-on-surface-variant">High-contrast dark mode</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
