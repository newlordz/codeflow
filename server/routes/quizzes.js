import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const quizzes = await query(`
      SELECT q.*, c.title as course_title,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.user_id = $1) as attempts,
        (SELECT MAX(qa.score) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.user_id = $1) as best_score,
        (SELECT MAX(qa.passed::int) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.user_id = $1) as passed
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      ORDER BY q.difficulty, q.title
    `, [req.user.id]);

    res.json(quizzes.rows);
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = await query(`
      SELECT q.*, c.title as course_title
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = $1
    `, [req.params.id]);

    if (quiz.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempts = await query(
      'SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY completed_at DESC',
      [req.params.id, req.user.id]
    );

    const questions = quiz.rows[0].questions;
    const sanitizedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
    const questionsWithoutAnswers = sanitizedQuestions.map(({ correct, explanation, ...q }) => q);

    res.json({
      ...quiz.rows[0],
      questions: questionsWithoutAnswers,
      attempts: attempts.rows,
    });
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const quiz = await query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
    if (quiz.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = typeof quiz.rows[0].questions === 'string'
      ? JSON.parse(quiz.rows[0].questions)
      : quiz.rows[0].questions;

    let correctCount = 0;
    const results = questions.map((q, i) => {
      const isCorrect = answers[i] === q.correct;
      if (isCorrect) correctCount++;
      return { questionIndex: i, correct: isCorrect, userAnswer: answers[i], correctAnswer: q.correct, explanation: q.explanation };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.rows[0].passing_score;

    await query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, answers) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, req.params.id, score, passed, JSON.stringify(answers)]
    );

    if (passed) {
      const existingCert = await query(
        'SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2',
        [req.user.id, quiz.rows[0].course_id]
      );

      if (existingCert.rows.length === 0) {
        await query(
          'INSERT INTO certificates (user_id, course_id, quiz_id, score) VALUES ($1, $2, $3, $4)',
          [req.user.id, quiz.rows[0].course_id, req.params.id, score]
        );

        await query(
          `INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, 'certificate', '/certificates')`,
          [req.user.id, 'Certificate Earned!', `Congratulations! You earned a certificate for completing the ${quiz.rows[0].title} quiz!`]
        );
      }
    }

    await query(
      'INSERT INTO activities (user_id, action, description, metadata) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'quiz_completed', `${passed ? 'Passed' : 'Attempted'} "${quiz.rows[0].title}" - Score: ${score}%`, JSON.stringify({ score, passed })]
    );

    res.json({ score, passed, totalQuestions, correctCount, results });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/result', authMiddleware, async (req, res) => {
  try {
    const attempts = await query(
      'SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY completed_at DESC',
      [req.params.id, req.user.id]
    );
    res.json(attempts.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
