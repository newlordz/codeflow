import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lesson = await query(`
      SELECT l.*,
        COALESCE(up.completed, false) as completed,
        up.score,
        up.completed_at,
        c.title as course_title
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $2
      WHERE l.id = $1
    `, [req.params.id, req.user.id]);

    if (lesson.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const prevNext = await query(`
      SELECT id, title FROM lessons
      WHERE course_id = $1
      ORDER BY order_num ASC
    `, [lesson.rows[0].course_id]);

    const currentIdx = prevNext.rows.findIndex(l => l.id === req.params.id);

    res.json({
      ...lesson.rows[0],
      prev_lesson: currentIdx > 0 ? prevNext.rows[currentIdx - 1] : null,
      next_lesson: currentIdx < prevNext.rows.length - 1 ? prevNext.rows[currentIdx + 1] : null,
    });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const lesson = await query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (lesson.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const existing = await query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [req.user.id, req.params.id]
    );

    if (existing.rows.length > 0 && existing.rows[0].completed) {
      return res.json({ message: 'Already completed', progress: existing.rows[0] });
    }

    if (existing.rows.length > 0) {
      await query(
        'UPDATE user_progress SET completed = true, completed_at = NOW(), score = $3 WHERE id = $1',
        [existing.rows[0].id, req.params.id, req.body.score || 100]
      );
    } else {
      await query(
        'INSERT INTO user_progress (user_id, course_id, lesson_id, completed, completed_at, score) VALUES ($1, $2, $3, true, NOW(), $4)',
        [req.user.id, lesson.rows[0].course_id, req.params.id, req.body.score || 100]
      );
    }

    const totalLessons = await query(
      'SELECT COUNT(*) as count FROM lessons WHERE course_id = $1',
      [lesson.rows[0].course_id]
    );
    const completedLessons = await query(
      'SELECT COUNT(*) as count FROM user_progress WHERE user_id = $1 AND course_id = $2 AND completed = true',
      [req.user.id, lesson.rows[0].course_id]
    );

    const progress = totalLessons.rows[0].count > 0
      ? Math.round((completedLessons.rows[0].count / totalLessons.rows[0].count) * 100)
      : 0;

    await query(
      'UPDATE user_courses SET progress = $1 WHERE user_id = $2 AND course_id = $3',
      [progress, req.user.id, lesson.rows[0].course_id]
    );

    const today = new Date().toISOString().split('T')[0];
    const streakEntry = await query(
      'SELECT * FROM streak_history WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );

    if (streakEntry.rows.length === 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const yesterdayStreak = await query(
        'SELECT * FROM streak_history WHERE user_id = $1 AND date = $2',
        [req.user.id, yesterday]
      );

      let newStreak = 1;
      if (yesterdayStreak.rows.length > 0) {
        newStreak = yesterdayStreak.rows[0].count + 1;
      }

      await query(
        'INSERT INTO streak_history (user_id, date, count) VALUES ($1, $2, $3)',
        [req.user.id, today, newStreak]
      );

      await query(
        'UPDATE users SET streak = $1, last_active = $2, longest_streak = GREATEST(longest_streak, $1) WHERE id = $3',
        [newStreak, today, req.user.id]
      );

      await query(
        'INSERT INTO activities (user_id, action, description, metadata) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'streak', `Day ${newStreak} streak achieved!`, JSON.stringify({ streak: newStreak })]
      );
    }

    await query(
      'INSERT INTO activities (user_id, action, description, metadata) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'lesson_completed', `Completed "${lesson.rows[0].title}"`, JSON.stringify({ lessonId: req.params.id })]
    );

    const motivationalMessages = [
      'Crushing it! Every lesson brings you closer to mastery.',
      'Another one down! Your dedication is impressive.',
      'You are building real skills that will change your career. Keep going!',
      'Consistency is the key to mastery. And you have got it!',
      'Small steps every day lead to giant leaps. You are doing amazing!',
    ];

    await query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, 'motivation', $4)`,
      [req.user.id, 'Lesson Completed!', motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)], `/lessons/${req.params.id}`]
    );

    res.json({ message: 'Lesson completed', progress, streak: await getCurrentStreak(req.user.id) });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function getCurrentStreak(userId) {
  const today = new Date().toISOString().split('T')[0];
  const result = await query('SELECT count FROM streak_history WHERE user_id = $1 AND date = $2', [userId, today]);
  return result.rows.length > 0 ? result.rows[0].count : 0;
}

export default router;
