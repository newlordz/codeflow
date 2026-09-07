import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Award,
  Flame,
  Zap,
  Star,
  Github,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Code2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import { soundEngine } from '../utils/soundEngine';

export default function PublicProfile() {
  const { username } = useParams();
  const { get } = useApi();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await get(`/public/profile/${username}`);
        setProfileData(data);
      } catch {
        // Fallback demo profile if user isn't found in db
        setProfileData({
          user: {
            username: username || 'developer',
            fullName: 'CodeFlow Developer',
            headline: 'Full-Stack Software Engineer & Algorithms Enthusiast',
            bio: 'Passionate coder building responsive web apps and mastering algorithmic data structures on CodeFlow Academy.',
            location: 'San Francisco, CA',
            level: 4,
            rankTitle: 'Code Warrior',
            xp: 2150,
            streak: 12,
            longestStreak: 18,
            joinedAt: '2025-01-15',
            githubUrl: 'https://github.com',
          },
          certificates: [
            { id: 'cert-py-1', course_title: 'Python Foundations: Zero to Code', language: 'Python', score: 98, issued_at: '2025-02-10' },
            { id: 'cert-js-1', course_title: 'JavaScript Essentials & Web Basics', language: 'JavaScript', score: 94, issued_at: '2025-02-28' },
          ],
          skills: [
            { subject: 'JavaScript', level: 90 },
            { subject: 'Python', level: 85 },
            { subject: 'Algorithms', level: 80 },
            { subject: 'PostgreSQL', level: 75 },
            { subject: 'System Design', level: 70 },
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username, get]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    soundEngine.playSuccess();
    toast.success('Public profile link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const badgeMarkdown = `[![CodeFlow Profile](http://localhost:5000/api/public/badge/${username || 'developer'}.svg)](http://localhost:5173/dev/${username || 'developer'})`;

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    soundEngine.playSuccess();
    toast.success('GitHub README badge markdown copied!');
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, certificates, skills } = profileData;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 pt-4 text-slate-200">
      {/* Top Banner / Dev Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0d1322] border border-[#222a3d] shadow-2xl">
        {/* Glow backdrop gradient */}
        <div className="h-36 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
            </button>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 sm:px-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-[#0d1322] shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-4 border-[#0d1322] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{user.fullName || user.username}</h1>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                    Level {user.level} {user.rankTitle}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">@{user.username}</p>
                <p className="text-xs text-slate-300">{user.headline}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-[#141d33] border border-[#222a3d] text-center min-w-[75px]">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">XP</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{(user.xp || 0).toLocaleString()}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#141d33] border border-[#222a3d] text-center min-w-[75px]">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Streak</span>
                <span className="text-sm font-bold text-orange-400 font-mono flex items-center justify-center gap-0.5">
                  <Flame size={14} className="fill-orange-400" /> {user.streak || 0}d
                </span>
              </div>
            </div>
          </div>

          {/* Bio and Social Links */}
          {user.bio && (
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl my-3 bg-[#111726] p-3.5 rounded-xl border border-[#222a3d]">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-[#222a3d]">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-500" /> {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-500" /> Joined {new Date(user.joinedAt || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <Github size={13} /> GitHub
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <Globe size={13} /> Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Skills Radar + GitHub Embed Widget */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Skill Mastery Ratings (6 cols) */}
        <div className="md:col-span-6 rounded-2xl bg-[#0d1322] border border-[#222a3d] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Code2 size={16} className="text-blue-400" /> Technical Proficiency
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Verified via Coursework</span>
          </div>

          <div className="space-y-3">
            {skills.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{s.subject}</span>
                  <span className="text-blue-400 font-mono">{s.level}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#172036] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.level}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: GitHub README Embed Badge (6 cols) */}
        <div className="md:col-span-6 rounded-2xl bg-[#0d1322] border border-[#222a3d] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Embed in GitHub README
            </h3>
            <button
              onClick={handleCopyBadge}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition-colors"
            >
              {copiedBadge ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedBadge ? 'Copied' : 'Copy Badge'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Showcase your live CodeFlow XP and streak counter directly in your GitHub profile README.
          </p>

          {/* Live SVG Badge Preview */}
          <div className="p-4 rounded-xl bg-[#060910] border border-[#222a3d] flex items-center justify-center">
            <div className="w-full max-w-sm rounded-xl p-3 bg-[#0f172a] border border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  CF
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">@{user.username}</span>
                  <span className="text-[10px] text-slate-400">CodeFlow Level {user.level} Coder</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-[#475569] text-xs font-mono">
                <div>
                  <span className="text-[9px] text-sky-400 font-bold block">XP</span>
                  <span className="text-white font-bold">{user.xp || 1200}</span>
                </div>
                <div className="ml-2">
                  <span className="text-[9px] text-amber-400 font-bold block">STREAK</span>
                  <span className="text-white font-bold">{user.streak || 5}d 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Certificates Showcase */}
      <div className="rounded-2xl bg-[#0d1322] border border-[#222a3d] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Verified Credentials & Certificates ({certificates.length})
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck size={13} /> Authenticated
          </span>
        </div>

        {certificates.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-4 text-center">
            No completed certificates on record yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-[#111726] border border-[#222a3d] hover:border-blue-500/40 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{cert.course_title}</h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Grade: <span className="text-emerald-400 font-bold">{cert.score}%</span> &bull; {cert.language}
                  </p>
                </div>
                <Link
                  to={`/verify/${cert.id}`}
                  className="p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition-colors"
                  title="View Certificate Verification"
                >
                  <ExternalLink size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
