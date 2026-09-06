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

    // 2. Enrolled courses with dynamic accurate progress
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

    const enrolledCourses = coursesRes.rows.map((c) => {
      const completed = parseInt(c.completed_lessons || 0, 10);
      const total = parseInt(c.lessons_count || 0, 10);
      const dynamicProgress = total > 0 ? Math.round((completed / total) * 100) : (c.progress || 0);
      return {
        ...c,
        completed_lessons: completed,
        lessons_count: total,
        progress: dynamicProgress,
      };
    });

    // 3. Lessons completed count
    const lessonsRes = await query(
      'SELECT COUNT(*) as count FROM user_progress WHERE user_id = $1 AND completed = true',
      [userId]
    );
    const totalCompletedLessons = parseInt(lessonsRes.rows[0]?.count || 0, 10);
    const totalEnrolledLessons = enrolledCourses.reduce((acc, c) => acc + c.lessons_count, 0);
    const overallProgress = totalEnrolledLessons > 0 
      ? Math.round((totalCompletedLessons / totalEnrolledLessons) * 100) 
      : 0;

    // 4. Find next up lesson to resume
    let nextLesson = null;
    if (enrolledCourses.length > 0) {
      for (const course of enrolledCourses) {
        const nextRes = await query(`
          SELECT l.id, l.title, l.order_num, l.duration, l.xp_reward, c.title as course_title, c.id as course_id
          FROM lessons l
          JOIN courses c ON l.course_id = c.id
          LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1 AND up.completed = true
          WHERE l.course_id = $2 AND (up.completed IS NULL OR up.completed = false)
          ORDER BY l.order_num ASC
          LIMIT 1
        `, [userId, course.id]);

        if (nextRes.rows.length > 0) {
          nextLesson = nextRes.rows[0];
          break;
        }
      }
    }

    // 5. Certificates count
    const certsRes = await query(
      'SELECT COUNT(*) as count FROM certificates WHERE user_id = $1',
      [userId]
    );

    // 6. Quiz average score
    const quizAvgRes = await query(
      'SELECT AVG(score) as avg_score FROM quiz_attempts WHERE user_id = $1',
      [userId]
    );

    // 7. Streak history for the last 7 days
    const streakRes = await query(
      'SELECT date, count FROM streak_history WHERE user_id = $1 ORDER BY date DESC LIMIT 7',
      [userId]
    );

    // 8. Recent activities
    const activitiesRes = await query(
      'SELECT action, description, created_at FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6',
      [userId]
    );

    res.json({
      coursesInProgress: enrolledCourses.length,
      enrolledCourses,
      lessonsCompleted: totalCompletedLessons,
      totalEnrolledLessons,
      overallProgress,
      nextLesson,
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
