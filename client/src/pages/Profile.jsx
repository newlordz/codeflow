import { useState, useRef } from 'react';
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
  Camera,
  Trash2,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
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
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'edit' | 'security' | 'preferences'

  // Profile fields
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [location, setLocation] = useState(user?.location || '');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.website_url || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (user?.full_name || user?.username || 'CF')
    .slice(0, 2)
    .toUpperCase();

  // Compress & resize image to 256x256 WebP before uploading
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        toast.success('Photo ready! Click "Save Changes" to apply.', { icon: '📸' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Photo removed. Save changes to update profile.', { icon: '🗑️' });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const payload = {
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        headline: headline.trim(),
        location: location.trim(),
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        website_url: websiteUrl.trim(),
        bio: bio.trim(),
        avatar: avatar || null,
      };

      const updated = await put('/auth/me', payload);
      const mergedUser = { ...user, ...updated };
      setUser(mergedUser);
      localStorage.setItem('codeflow-user', JSON.stringify(mergedUser));
      toast.success('Profile updated successfully!', { icon: '✨' });
      setActiveTab('profile');
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
      {/* Top Banner Hero Card */}
      <div className="glass-panel shadow-premium rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-outline-variant/30">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[110px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,142,255,0.18), transparent 70%)' }}
        />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative group flex-shrink-0">
            {avatar || user?.avatar ? (
              <img
                src={avatar || user?.avatar}
                alt={user?.username}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-xl border-2 border-primary/30"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/20">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform active:scale-95 border-2 border-surface"
              title="Upload profile photo"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface display-tight truncate">
                {user?.full_name || user?.username || 'Developer'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                  user?.role === 'admin'
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/25'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Student Learner'}
              </span>
            </div>

            {user?.headline && (
              <p className="text-sm font-medium text-primary mb-2 flex items-center justify-center sm:justify-start gap-1.5">
                <Briefcase size={14} />
                <span>{user.headline}</span>
              </p>
            )}

            <p className="text-xs text-on-surface-variant font-mono mb-4">
              @{user?.username} &bull; {user?.email}
            </p>

            {/* Quick Contact & Social Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-on-surface-variant">
              {user?.phone && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 font-mono">
                  <Phone size={12} className="text-primary" />
                  {user.phone}
                </span>
              )}
              {user?.location && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30">
                  <MapPin size={12} className="text-rose-500" />
                  {user.location}
                </span>
              )}
              {user?.github_url && (
                <a
                  href={user.github_url.startsWith('http') ? user.github_url : `https://${user.github_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors"
                >
                  <Github size={12} />
                  <span>GitHub</span>
                  <ExternalLink size={10} className="text-on-surface-variant/60" />
                </a>
              )}
              {user?.linkedin_url && (
                <a
                  href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors"
                >
                  <Linkedin size={12} className="text-blue-500" />
                  <span>LinkedIn</span>
                  <ExternalLink size={10} className="text-on-surface-variant/60" />
                </a>
              )}
              {user?.website_url && (
                <a
                  href={user.website_url.startsWith('http') ? user.website_url : `https://${user.website_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors"
                >
                  <Globe size={12} className="text-emerald-500" />
                  <span>Portfolio</span>
                  <ExternalLink size={10} className="text-on-surface-variant/60" />
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className="btn-primary px-5 py-2 text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <span>Edit Profile Details</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6 text-sm font-semibold overflow-x-auto pb-px">
        {[
          { key: 'profile', label: 'Overview', icon: User },
          { key: 'edit', label: 'Edit Profile & Info', icon: Camera },
          { key: 'security', label: 'Security & Password', icon: Key },
          { key: 'preferences', label: 'Preferences', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-3 transition-colors relative flex-shrink-0 ${
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Milestone Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-on-surface-variant">Daily Streak</span>
                <Flame size={18} className="text-amber-500" />
              </div>
              <p className="text-3xl font-bold font-mono text-on-surface">
                {user?.streak || 0}{' '}
                <span className="text-xs font-normal text-on-surface-variant">days</span>
              </p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">
                Best: {user?.longest_streak || user?.streak || 0}d
              </p>
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

          {/* About & Bio Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-outline-variant/25">
            <h3 className="text-lg font-bold text-on-surface mb-3">About Me</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
              {user?.bio ||
                'No bio added yet. Click "Edit Profile & Info" above to add your developer story, skills, phone number, and social links!'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE & INFO */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Edit Section */}
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <Camera size={18} className="text-primary" />
              Profile Photo
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center border border-outline-variant/40 shadow-sm flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Camera size={14} />
                  <span>Choose Photo</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-ghost text-xs text-rose-500 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl border border-rose-500/20 flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Personal Info */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-outline-variant/30 space-y-4">
            <h3 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Personal Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Enoch Essel"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                  Display Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. newlordz"
                  className="input-premium px-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                  <Phone size={12} className="text-primary" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +233 24 123 4567"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" /> Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                <Briefcase size={12} className="text-violet-500" /> Professional Headline / Tagline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full-Stack Developer & Python Enthusiast"
                className="input-premium px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5">
                Bio / About You
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other students and mentors about your background, coding journey, and goals..."
                rows={4}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3.5 text-sm text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Social & Portfolio Links */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-outline-variant/30 space-y-4">
            <h3 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Social & Portfolio Links
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                  <Github size={12} /> GitHub Profile
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="github.com/newlordz"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                  <Linkedin size={12} className="text-blue-500" /> LinkedIn Profile
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1">
                  <Globe size={12} className="text-emerald-500" /> Website / Portfolio
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="input-premium px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary px-7 py-2.5 text-xs rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Save size={14} />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Email Info */}
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-2">Account Email</h3>
            <div>
              <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">
                Registered Email
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

          {/* Change Password Form */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-outline-variant/30">
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

      {/* TAB 4: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-outline-variant/30">
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
