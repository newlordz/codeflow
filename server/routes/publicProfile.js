import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Publicly get user developer profile without requiring authentication
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const userRes = await query(
      `SELECT id, username, full_name, avatar, bio, headline, location, github_url, linkedin_url, website_url, xp, streak, longest_streak, joined_at
       FROM users WHERE LOWER(username) = LOWER($1)`,
      [username]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    const u = userRes.rows[0];

    // Fetch verified certificates
    const certsRes = await query(
      `SELECT c.id, c.issued_at, c.score, cr.title as course_title, cr.language
       FROM certificates c
       JOIN courses cr ON cr.id = c.course_id
       WHERE c.user_id = $1
       ORDER BY c.issued_at DESC`,
      [u.id]
    );

    // Calculate level based on XP
    const xp = u.xp || 0;
    const level = Math.floor(xp / 500) + 1;
    let rankTitle = 'Apprentice';
    if (level >= 10) rankTitle = 'Archmage of Code';
    else if (level >= 6) rankTitle = 'Senior Full-Stack';
    else if (level >= 3) rankTitle = 'Code Warrior';

    res.json({
      user: {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        avatar: u.avatar,
        bio: u.bio,
        headline: u.headline || 'Full-Stack Developer & CodeFlow Member',
        location: u.location,
        githubUrl: u.github_url,
        linkedinUrl: u.linkedin_url,
        websiteUrl: u.website_url,
        xp,
        level,
        rankTitle,
        streak: u.streak || 0,
        longestStreak: u.longest_streak || 0,
        joinedAt: u.joined_at,
      },
      certificates: certsRes.rows,
      skills: [
        { subject: 'Python', level: 85, fullMark: 100 },
        { subject: 'JavaScript', level: 90, fullMark: 100 },
        { subject: 'Algorithms', level: 80, fullMark: 100 },
        { subject: 'PostgreSQL', level: 75, fullMark: 100 },
        { subject: 'System Design', level: 70, fullMark: 100 },
      ]
    });
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Dynamic SVG badge for embedding in GitHub READMEs
router.get('/badge/:username.svg', async (req, res) => {
  const { username } = req.params;

  try {
    const userRes = await query(
      `SELECT username, xp, streak FROM users WHERE LOWER(username) = LOWER($1)`,
      [username]
    );

    const u = userRes.rows[0] || { username, xp: 1200, streak: 5 };
    const xp = u.xp || 0;
    const streak = u.streak || 0;
    const level = Math.floor(xp / 500) + 1;

    const svg = `
<svg width="360" height="90" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="90" rx="16" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
  <circle cx="36" cy="45" r="20" fill="url(#grad)" />
  <text x="36" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">CF</text>
  
  <text x="68" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#f8fafc">@${u.username}</text>
  <text x="68" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8">CodeFlow Level ${level} Coder</text>
  
  <rect x="230" y="24" width="112" height="42" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <text x="246" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#38bdf8">XP</text>
  <text x="246" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${xp.toLocaleString()}</text>
  
  <text x="296" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#f59e0b">STREAK</text>
  <text x="296" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${streak}d 🔥</text>

  <defs>
    <linearGradient id="grad" x1="16" y1="25" x2="56" y2="65" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
</svg>
    `.trim();

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(svg);
  } catch {
    res.status(500).send('Error generating badge');
  }
});

export default router;
