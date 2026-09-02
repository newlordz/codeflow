import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await query(`
      SELECT n.*, c.title as course_title, l.title as lesson_title
      FROM notes n
      LEFT JOIN courses c ON n.course_id = c.id
      LEFT JOIN lessons l ON n.lesson_id = l.id
      WHERE n.user_id = $1
      ORDER BY n.updated_at DESC
    `, [req.user.id]);
    res.json(notes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { lesson_id, course_id, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await query(
      'INSERT INTO notes (user_id, lesson_id, course_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, lesson_id || null, course_id || null, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (note.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const result = await query(
      'UPDATE notes SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [req.body.content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
