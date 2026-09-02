import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. Platform Statistics
router.get('/stats', async (req, res) => {
  try {
    const [usersCount, coursesCount, lessonsCount, enrollmentsCount, certsCount, questionsCount, pendingQCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM courses'),
      query('SELECT COUNT(*) as count FROM lessons'),
      query('SELECT COUNT(*) as count FROM user_courses'),
      query('SELECT COUNT(*) as count FROM certificates'),
      query('SELECT COUNT(*) as count FROM questions'),
      query('SELECT COUNT(*) as count FROM questions WHERE answered = false'),
    ]);

    const recentUsers = await query(
      'SELECT id, username, email, role, joined_at FROM users ORDER BY joined_at DESC LIMIT 5'
    );

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count, 10),
      totalCourses: parseInt(coursesCount.rows[0].count, 10),
      totalLessons: parseInt(lessonsCount.rows[0].count, 10),
      totalEnrollments: parseInt(enrollmentsCount.rows[0].count, 10),
      totalCertificates: parseInt(certsCount.rows[0].count, 10),
      totalQuestions: parseInt(questionsCount.rows[0].count, 10),
      pendingQuestions: parseInt(pendingQCount.rows[0].count, 10),
      recentUsers: recentUsers.rows,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

// 2. User Management
router.get('/users', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.id, u.username, u.email, u.role, u.streak, u.xp, u.joined_at,
        (SELECT COUNT(*) FROM user_courses uc WHERE uc.user_id = u.id) as enrolled_courses,
        (SELECT COUNT(*) FROM certificates c WHERE c.user_id = u.id) as certificates_count
      FROM users u
      ORDER BY u.joined_at DESC
    `);
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (req.user.id === req.params.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote your own account' });
    }

    await query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: `Role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 3. Course Management
router.get('/courses', async (req, res) => {
  try {
    const courses = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as real_lessons_count,
        (SELECT COUNT(*) FROM user_courses uc WHERE uc.course_id = c.id) as real_enrolled_count
      FROM courses c
      ORDER BY c.order_num ASC, c.title ASC
    `);
    res.json(courses.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { title, description, language, level, icon, duration } = req.body;
    if (!title || !description || !language || !level) {
      return res.status(400).json({ error: 'Title, description, language, and level are required' });
    }

    const maxOrder = await query('SELECT COALESCE(MAX(order_num), 0) + 1 as next_order FROM courses');
    const nextOrder = maxOrder.rows[0].next_order;

    const result = await query(
      `INSERT INTO courses (title, description, language, level, icon, duration, order_num, lessons_count, enrolled_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0) RETURNING *`,
      [title, description, language, level, icon || 'terminal', duration || '6 weeks', nextOrder]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { title, description, language, level, icon, duration } = req.body;
    const result = await query(
      `UPDATE courses SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        language = COALESCE($3, language),
        level = COALESCE($4, level),
        icon = COALESCE($5, icon),
        duration = COALESCE($6, duration)
       WHERE id = $7 RETURNING *`,
      [title, description, language, level, icon, duration, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// 4. Lesson Management
router.get('/courses/:id/lessons', async (req, res) => {
  try {
    const lessons = await query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_num ASC',
      [req.params.id]
    );
    res.json(lessons.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.post('/courses/:id/lessons', async (req, res) => {
  try {
    const { title, description, content, video_url, duration, transcript } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Lesson title and content are required' });
    }

    const maxOrder = await query(
      'SELECT COALESCE(MAX(order_num), 0) + 1 as next_order FROM lessons WHERE course_id = $1',
      [req.params.id]
    );
    const nextOrder = maxOrder.rows[0].next_order;

    const result = await query(
      `INSERT INTO lessons (course_id, title, description, content, video_url, duration, transcript, order_num)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.params.id,
        title,
        description || '',
        content,
        video_url || null,
        duration || '15 min',
        transcript || '',
        nextOrder,
      ]
    );

    // Update course lessons_count
    await query(
      'UPDATE courses SET lessons_count = (SELECT COUNT(*) FROM lessons WHERE course_id = $1) WHERE id = $1',
      [req.params.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    const lessonRes = await query('SELECT course_id FROM lessons WHERE id = $1', [req.params.id]);
    if (lessonRes.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const courseId = lessonRes.rows[0].course_id;

    await query('DELETE FROM lessons WHERE id = $1', [req.params.id]);

    // Update course count
    await query(
      'UPDATE courses SET lessons_count = (SELECT COUNT(*) FROM lessons WHERE course_id = $1) WHERE id = $1',
      [courseId]
    );

    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// 5. Q&A Moderation
router.get('/questions', async (req, res) => {
  try {
    const questions = await query(`
      SELECT q.*, u.username as student_name, u.email as student_email
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC
    `);
    res.json(questions.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/questions/:id/answer', async (req, res) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ error: 'Answer response cannot be empty' });
    }

    const result = await query(
      `UPDATE questions SET response = $1, answered = true WHERE id = $2 RETURNING *`,
      [response, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Also send an in-app notification to the student
    const question = result.rows[0];
    if (question.user_id) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          question.user_id,
          'Your Question Was Answered!',
          `An instructor answered your question: "${question.subject}"`,
          'success',
          '/qa',
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Answer question error:', err);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

export default router;
