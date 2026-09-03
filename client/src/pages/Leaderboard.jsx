import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Star,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

export default function Leaderboard() {
  const { get } = useApi();
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'all_time'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await get(`/leaderboard?period=${period}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [get, period]);

  const podium = data?.podium || [];
  const leaderboard = data?.leaderboard || [];
  const currentUser = data?.currentUserRank;

  // Podium order: 2nd place (left), 1st place (center, highest), 3rd place (right)
  const firstPlace = podium[0];
  const secondPlace = podium[1];
  const thirdPlace = podium[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-16"
    >
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold mb-2">
            <Trophy size={14} className="text-amber-400" />
            <span>Competitive XP Arena</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface">
            Global Leaderboard & XP Race
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 max-w-2xl">
            Climb the ranks by solving challenges, mastering courses, and maintaining your daily streak to earn up to <strong>2.0x Double XP</strong>!
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-container/60 border border-outline-variant/30 backdrop-blur-sm self-start md:self-auto">
          <button
            onClick={() => setPeriod('weekly')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              period === 'weekly'
                ? 'bg-primary text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Zap size={14} />
            <span>Weekly Race</span>
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              period === 'all_time'
                ? 'bg-primary text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Trophy size={14} />
            <span>All-Time Legends</span>
          </button>
        </div>
      </div>

      {/* Your Personal Standing Sticky Banner */}
      {currentUser && (
        <div className="glass-panel shadow-premium rounded-2xl p-4 md:p-5 border-primary/30 bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-purple-950/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
              #{currentUser.rank || '-'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">Your Standing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <span>{currentUser.tier?.badge}</span> {currentUser.tier?.name}
                </span>
              </div>
              <p className="text-base font-bold text-on-surface mt-0.5">
                {currentUser.full_name || currentUser.username || 'You'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="text-right">
              <span className="text-[11px] font-mono text-on-surface-variant block">Streak Flame</span>
              <span className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1">
                <Flame size={15} className="fill-amber-400 text-amber-500 animate-pulse" />
                {currentUser.streak || 0} Days
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-on-surface-variant block">Active Boost</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 inline-flex items-center gap-1">
                <Zap size={12} /> {currentUser.multiplier?.label || '1.0x'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-on-surface-variant block">Total Score</span>
              <span className="text-lg font-extrabold text-on-surface font-mono">
                {currentUser.displayXp?.toLocaleString() || 0} <span className="text-xs text-primary font-bold">XP</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Champion Podium Section */}
      {podium.length >= 3 && (
        <div className="glass-panel shadow-premium rounded-3xl p-6 md:p-8 pt-10 relative overflow-hidden border-outline-variant/30">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">Top 3 Champions</span>
            <h2 className="text-2xl font-bold text-on-surface mt-1">Hall of Mastery</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-6 items-end max-w-3xl mx-auto pt-8">
            {/* 2nd Place Podium */}
            {secondPlace && (
              <div className="flex flex-col items-center">
                <div className="relative mb-3 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center mb-1 shadow-md">
                    2
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-lg shadow-slate-500/20 bg-slate-800">
                    <img
                      src={secondPlace.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={secondPlace.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-xs md:text-sm font-bold text-on-surface text-center truncate max-w-[90px] md:max-w-[140px]">
                  {secondPlace.full_name || secondPlace.username}
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {secondPlace.displayXp?.toLocaleString()} XP
                </span>
                {/* Pedestal */}
                <div className="w-full h-28 md:h-36 mt-3 rounded-t-2xl bg-gradient-to-t from-slate-900/90 to-slate-700/40 border-t-2 border-slate-300 flex flex-col items-center justify-center shadow-inner">
                  <Medal size={24} className="text-slate-300" />
                  <span className="text-xs font-mono text-slate-300 font-bold mt-1">Silver</span>
                </div>
              </div>
            )}

            {/* 1st Place Podium (Taller in center) */}
            {firstPlace && (
              <div className="flex flex-col items-center -mt-6">
                <div className="relative mb-3 flex flex-col items-center">
                  <Crown size={26} className="text-amber-400 animate-bounce mb-1" />
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-2xl shadow-amber-500/30 bg-slate-800">
                    <img
                      src={firstPlace.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={firstPlace.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-sm md:text-base font-extrabold text-amber-300 text-center truncate max-w-[100px] md:max-w-[160px]">
                  {firstPlace.full_name || firstPlace.username}
                </p>
                <span className="text-xs font-mono text-amber-400 font-bold mt-0.5">
                  {firstPlace.displayXp?.toLocaleString()} XP
                </span>
                {/* Pedestal */}
                <div className="w-full h-40 md:h-48 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-950/80 via-amber-900/30 to-amber-500/25 border-t-4 border-amber-400 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/15">
                  <Trophy size={32} className="text-amber-400" />
                  <span className="text-sm font-mono text-amber-300 font-bold mt-1">Grandmaster</span>
                  <span className="text-[10px] font-mono text-amber-400/80">Rank 1</span>
                </div>
              </div>
            )}

            {/* 3rd Place Podium */}
            {thirdPlace && (
              <div className="flex flex-col items-center">
                <div className="relative mb-3 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center mb-1 shadow-md">
                    3
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-amber-700 shadow-lg shadow-amber-700/20 bg-slate-800">
                    <img
                      src={thirdPlace.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'}
                      alt={thirdPlace.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-xs md:text-sm font-bold text-on-surface text-center truncate max-w-[90px] md:max-w-[140px]">
                  {thirdPlace.full_name || thirdPlace.username}
                </p>
                <span className="text-[10px] font-mono text-amber-600 mt-0.5">
                  {thirdPlace.displayXp?.toLocaleString()} XP
                </span>
                {/* Pedestal */}
                <div className="w-full h-24 md:h-30 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-950/80 to-amber-900/30 border-t-2 border-amber-700 flex flex-col items-center justify-center shadow-inner">
                  <Medal size={22} className="text-amber-600" />
                  <span className="text-xs font-mono text-amber-500 font-bold mt-1">Bronze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* League Tiers Tracker */}
      <div className="glass-panel shadow-premium rounded-2xl p-5 border-outline-variant/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-bold">
            League Tiers & XP Thresholds
          </h3>
          <span className="text-xs font-mono text-primary font-semibold">
            Multiplier up to 2.0x Double XP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {[
            { name: 'Bronze', range: '0 - 499', badge: '🥉', color: 'border-amber-700/30 bg-amber-950/10' },
            { name: 'Silver', range: '500 - 1,499', badge: '🥈', color: 'border-slate-500/30 bg-slate-900/20' },
            { name: 'Gold', range: '1,500 - 2,999', badge: '🥇', color: 'border-amber-500/30 bg-amber-950/20' },
            { name: 'Platinum', range: '3,000 - 5,999', badge: '⚡', color: 'border-teal-500/30 bg-teal-950/20' },
            { name: 'Diamond', range: '6,000 - 9,999', badge: '💎', color: 'border-cyan-500/30 bg-cyan-950/20' },
            { name: 'Grandmaster', range: '10,000+', badge: '👑', color: 'border-purple-500/30 bg-purple-950/20' },
          ].map((t) => (
            <div key={t.name} className={`p-3 rounded-xl border ${t.color} text-center`}>
              <span className="text-xl block mb-1">{t.badge}</span>
              <p className="font-bold text-on-surface">{t.name}</p>
              <span className="text-[10px] font-mono text-on-surface-variant block mt-0.5">{t.range} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="glass-panel shadow-premium rounded-2xl overflow-hidden border-outline-variant/30">
        <div className="px-6 py-4 bg-surface-container/60 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Award size={16} className="text-primary" />
            <span>Complete Rankings</span>
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">
            {leaderboard.length} Engineers Competing
          </span>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {leaderboard.map((user, i) => {
            const isTop3 = user.rank <= 3;
            const rankBadgeColor =
              user.rank === 1
                ? 'bg-amber-400 text-slate-950 font-extrabold'
                : user.rank === 2
                ? 'bg-slate-300 text-slate-950 font-bold'
                : user.rank === 3
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-surface-container text-on-surface-variant font-mono';

            return (
              <div
                key={user.id || i}
                className={`flex items-center justify-between p-4 px-6 hover:bg-surface-container-high/40 transition-colors ${
                  user.isCurrentUser ? 'bg-primary/10 border-l-4 border-primary' : ''
                }`}
              >
                {/* Left: Rank + Avatar + Name */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 shadow-xs ${rankBadgeColor}`}
                  >
                    {user.rank}
                  </div>

                  <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex-shrink-0 bg-surface-container">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        {(user.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-sm truncate">
                        {user.full_name || user.username}
                      </span>
                      {user.isCurrentUser && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">
                      {user.headline || (user.role === 'admin' ? 'Curriculum Director' : 'Software Engineering Student')}
                    </p>
                  </div>
                </div>

                {/* Right: Tier + Streak + Multiplier + XP */}
                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                  <div className="hidden md:flex items-center gap-1 text-xs font-medium text-on-surface">
                    <span className="text-base">{user.tier?.badge}</span>
                    <span className="hidden lg:inline">{user.tier?.name}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400 font-mono">
                    <Flame size={14} className="fill-amber-400" />
                    <span>{user.streak || 0}d</span>
                  </div>

                  {user.multiplier?.value > 1 && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {user.multiplier.label.split(' ')[0]}
                    </span>
                  )}

                  <div className="text-right min-w-[75px]">
                    <span className="text-sm md:text-base font-extrabold text-on-surface font-mono">
                      {user.displayXp?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-primary font-bold ml-1 font-mono">XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
