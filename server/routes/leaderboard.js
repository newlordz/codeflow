import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Benchmark pioneers to make leaderboard competitive and vibrant
const legendaryPioneers = [
  {
    id: 'pioneer-ada',
    username: 'adalovelace',
    full_name: 'Ada Lovelace',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    xp: 8450,
    streak: 42,
    role: 'student',
    headline: 'First Computer Programmer'
  },
  {
    id: 'pioneer-turing',
    username: 'alanturing',
    full_name: 'Alan Turing',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    xp: 6200,
    streak: 24,
    role: 'student',
    headline: 'Father of Modern Computing'
  },
  {
    id: 'pioneer-hopper',
    username: 'gracehopper',
    full_name: 'Grace Hopper',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    xp: 5900,
    streak: 19,
    role: 'student',
    headline: 'Compiler Pioneer & Admiral'
  },
  {
    id: 'pioneer-linus',
    username: 'linustorvalds',
    full_name: 'Linus Torvalds',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    xp: 4850,
    streak: 15,
    role: 'student',
    headline: 'Creator of Linux & Git'
  },
  {
    id: 'pioneer-hamilton',
    username: 'margarethamilton',
    full_name: 'Margaret Hamilton',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    xp: 3950,
    streak: 11,
    role: 'student',
    headline: 'Director of Apollo Flight Software'
  }
];

router.get('/', async (req, res) => {
  try {
    const period = req.query.period || 'weekly';

    // 1. Fetch real registered users from the database
    const dbUsersRes = await query(`
      SELECT id, username, full_name, avatar, xp, streak, role, headline
      FROM users
      ORDER BY xp DESC
    `);

    let combinedUsers = [...dbUsersRes.rows];

    // Merge benchmark pioneers (excluding duplicates)
    for (const pioneer of legendaryPioneers) {
      if (!combinedUsers.some(u => u.username?.toLowerCase() === pioneer.username.toLowerCase())) {
        combinedUsers.push(pioneer);
      }
    }

    // Sort by XP descending (or simulated weekly variation for weekly race)
    if (period === 'weekly') {
      combinedUsers.sort((a, b) => {
        const aScore = Math.floor((a.xp || 0) * 0.4) + (a.streak || 0) * 20;
        const bScore = Math.floor((b.xp || 0) * 0.4) + (b.streak || 0) * 20;
        return bScore - aScore;
      });
    } else {
      combinedUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }

    // Decorate with rank, tier, and streak multiplier
    const rankedUsers = combinedUsers.map((user, index) => {
      const rank = index + 1;
      const xp = period === 'weekly'
        ? Math.floor((user.xp || 0) * 0.4) + (user.streak || 0) * 20
        : (user.xp || 0);

      const tier = getTier(xp);
      const multiplier = getStreakMultiplier(user.streak || 0);

      return {
        ...user,
        rank,
        displayXp: xp,
        tier,
        multiplier,
        isCurrentUser: user.id === req.user?.id || user.email === req.user?.email,
      };
    });

    const podium = rankedUsers.slice(0, 3);
    const currentUserRank = rankedUsers.find(u => u.isCurrentUser) || {
      rank: rankedUsers.length + 1,
      displayXp: req.user?.xp || 0,
      tier: getTier(req.user?.xp || 0),
      multiplier: getStreakMultiplier(req.user?.streak || 0),
      isCurrentUser: true,
    };

    res.json({
      period,
      podium,
      leaderboard: rankedUsers,
      currentUserRank,
      totalParticipants: rankedUsers.length,
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

function getTier(xp = 0) {
  if (xp >= 10000) return { name: 'Grandmaster', badge: '👑', color: 'from-purple-500 to-pink-500', text: 'text-pink-400' };
  if (xp >= 6000) return { name: 'Diamond', badge: '💎', color: 'from-cyan-400 to-blue-500', text: 'text-cyan-400' };
  if (xp >= 3000) return { name: 'Platinum', badge: '⚡', color: 'from-teal-400 to-emerald-500', text: 'text-teal-400' };
  if (xp >= 1500) return { name: 'Gold', badge: '🥇', color: 'from-amber-400 to-yellow-500', text: 'text-amber-400' };
  if (xp >= 500) return { name: 'Silver', badge: '🥈', color: 'from-slate-300 to-slate-400', text: 'text-slate-300' };
  return { name: 'Bronze', badge: '🥉', color: 'from-amber-700 to-amber-800', text: 'text-amber-600' };
}

function getStreakMultiplier(streak = 0) {
  if (streak >= 30) return { value: 2.0, label: '2.0x Double XP', bonus: '+100%' };
  if (streak >= 14) return { value: 1.5, label: '1.5x XP Boost', bonus: '+50%' };
  if (streak >= 7) return { value: 1.25, label: '1.25x XP Boost', bonus: '+25%' };
  if (streak >= 3) return { value: 1.1, label: '1.1x XP Boost', bonus: '+10%' };
  return { value: 1.0, label: '1.0x Standard', bonus: '+0%' };
}

export default router;
