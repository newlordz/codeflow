import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. User stats
    const userRes = await query('SELECT streak, longest_streak, xp FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0] || {};

    // 2. Enrolled courses
    const coursesRes = await query(`
      SELECT c.*, 
        COALESCE(uc.progress, 0) as progress, 
        uc.enrolled_at,
        (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = $1 AND up.course_id = c.id AND up.completed = true) as completed_lessons
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.enrolled_at DESC
    `, [userId]);

    // 3. Lessons completed count
    const lessonsRes = await query(
      'SELECT COUNT(*) as count FROM user_progress WHERE user_id = $1 AND completed = true',
      [userId]
    );

    // 4. Certificates count
    const certsRes = await query(
      'SELECT COUNT(*) as count FROM certificates WHERE user_id = $1',
      [userId]
    );

    // 5. Quiz average score
    const quizAvgRes = await query(
      'SELECT AVG(score) as avg_score FROM quiz_attempts WHERE user_id = $1',
      [userId]
    );

    // 6. Streak history for the last 7 days
    const streakRes = await query(
      'SELECT date, count FROM streak_history WHERE user_id = $1 ORDER BY date DESC LIMIT 7',
      [userId]
    );

    // 7. Recent activities
    const activitiesRes = await query(
      'SELECT action, description, created_at FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6',
      [userId]
    );

    res.json({
      coursesInProgress: coursesRes.rows.length,
      enrolledCourses: coursesRes.rows,
      lessonsCompleted: parseInt(lessonsRes.rows[0]?.count || 0, 10),
      certificatesEarned: parseInt(certsRes.rows[0]?.count || 0, 10),
      quizAverage: Math.round(parseFloat(quizAvgRes.rows[0]?.avg_score || 0)),
      currentStreak: user.streak || 0,
      longestStreak: user.longest_streak || 0,
      xp: user.xp || 0,
      recentActivity: activitiesRes.rows,
      streakHistory: streakRes.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
