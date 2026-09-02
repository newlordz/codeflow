import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const courses = await query(`
      SELECT c.*,
        CASE WHEN uc.user_id IS NOT NULL THEN true ELSE false END as enrolled,
        COALESCE(uc.progress, 0) as progress,
        (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = $1 AND up.course_id = c.id AND up.completed = true) as completed_lessons
      FROM courses c
      LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = $1
      ORDER BY c.order_num ASC
    `, [req.user.id]);

    res.json(courses.rows);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await query(`
      SELECT l.*,
        COALESCE(up.completed, false) as completed,
        up.score,
        up.completed_at
      FROM lessons l
      LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $2
      WHERE l.course_id = $1
      ORDER BY l.order_num ASC
    `, [req.params.id, req.user.id]);

    const enrollment = await query(
      'SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.id, req.params.id]
    );

    const quizzes = await query(
      'SELECT q.*, (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.user_id = $2) as attempts FROM quizzes q WHERE q.course_id = $1',
      [req.params.id, req.user.id]
    );

    res.json({
      ...course.rows[0],
      lessons: lessons.rows,
      enrolled: enrollment.rows.length > 0,
      progress: enrollment.rows.length > 0 ? enrollment.rows[0].progress : 0,
      quizzes: quizzes.rows,
    });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const existing = await query(
      'SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    await query(
      'INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)',
      [req.user.id, req.params.id]
    );

    await query(
      'UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = $1',
      [req.params.id]
    );

    const courseRes = await query('SELECT title FROM courses WHERE id = $1', [req.params.id]);
    const courseTitle = courseRes.rows[0]?.title || 'Course';

    await query(
      'INSERT INTO activities (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'enrolled', `Enrolled in ${courseTitle}`]
    );

    await query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.id,
        'Enrolled: ' + courseTitle + ' 🎓',
        `Welcome to ${courseTitle}! Your lessons and curriculum are ready.`,
        'course',
        `/courses/${req.params.id}`,
      ]
    );

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/unenroll', authMiddleware, async (req, res) => {
  try {
    const existing = await query(
      'SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length === 0) {
      return res.status(400).json({ error: 'Not enrolled in this course' });
    }

    await query(
      'DELETE FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [req.user.id, req.params.id]
    );

    await query(`
      DELETE FROM user_progress
      WHERE user_id = $1 AND lesson_id IN (SELECT id FROM lessons WHERE course_id = $2)
    `, [req.user.id, req.params.id]);

    await query(
      'UPDATE courses SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE id = $1',
      [req.params.id]
    );

    const courseRes = await query('SELECT title FROM courses WHERE id = $1', [req.params.id]);
    const courseTitle = courseRes.rows[0]?.title || 'the course';

    await query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.id,
        'Course Dropped',
        `You removed "${courseTitle}" from your courses. You can re-enroll anytime from the catalog.`,
        'info',
        '/courses',
      ]
    );

    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    console.error('Unenroll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
