import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const certificates = await query(`
      SELECT cert.*, c.title as course_title, c.language, c.level, q.title as quiz_title, q.difficulty
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      LEFT JOIN quizzes q ON cert.quiz_id = q.id
      WHERE cert.user_id = $1
      ORDER BY cert.issued_at DESC
    `, [req.user.id]);
    res.json(certificates.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
