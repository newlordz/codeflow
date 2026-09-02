import pool from './db.js';

async function check() {
  const u = await pool.query('SELECT id, username, email FROM users');
  for (const row of u.rows) {
    const uc = await pool.query(`
      SELECT c.title, c.language, c.level, uc.progress
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = $1
    `, [row.id]);
    console.log(row.username, row.email, 'enrolled in:', uc.rows.length);
    for (const c of uc.rows) {
      console.log('  -', c.title, `[${c.level}]`, `[${c.language}]`, c.progress + '%');
    }
  }
  process.exit(0);
}

check().catch(console.error);
