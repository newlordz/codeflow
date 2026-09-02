import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const streakResult = await query(
      'SELECT count FROM streak_history WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );
    const currentStreak = streakResult.rows.length > 0 ? streakResult.rows[0].count : 0;

    const userResult = await query('SELECT longest_streak FROM users WHERE id = $1', [req.user.id]);
    const longestStreak = userResult.rows[0]?.longest_streak || 0;

    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayResult = await query(
        'SELECT count FROM streak_history WHERE user_id = $1 AND date = $2',
        [req.user.id, dateStr]
      );
      weekDays.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayResult.rows.length > 0 ? dayResult.rows[0].count : 0,
      });
    }

    const todayActivities = await query(
      "SELECT * FROM activities WHERE user_id = $1 AND created_at::date = $2 ORDER BY created_at DESC",
      [req.user.id, today]
    );

    res.json({
      currentStreak,
      longestStreak,
      weekDays,
      todayActivities: todayActivities.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/activity', authMiddleware, async (req, res) => {
  try {
    const { action, description, metadata } = req.body;
    const result = await query(
      'INSERT INTO activities (user_id, action, description, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, action, description, metadata ? JSON.stringify(metadata) : '{}']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
