import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role, avatar, streak, longest_streak, theme, xp, bio, joined_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.email.toLowerCase() === 'admin@codeflow.com' && user.role !== 'admin') {
      user.role = 'admin';
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, role, avatar, phone, full_name, location, headline, github_url, linkedin_url, website_url, streak, longest_streak, theme, xp, bio, joined_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const {
      username,
      bio,
      theme,
      avatar,
      phone,
      full_name,
      location,
      headline,
      github_url,
      linkedin_url,
      website_url,
    } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (username !== undefined) { updates.push(`username = $${idx++}`); values.push(username.trim()); }
    if (bio !== undefined) { updates.push(`bio = $${idx++}`); values.push(bio); }
    if (theme !== undefined) { updates.push(`theme = $${idx++}`); values.push(theme); }
    if (avatar !== undefined) { updates.push(`avatar = $${idx++}`); values.push(avatar); }
    if (phone !== undefined) { updates.push(`phone = $${idx++}`); values.push(phone); }
    if (full_name !== undefined) { updates.push(`full_name = $${idx++}`); values.push(full_name); }
    if (location !== undefined) { updates.push(`location = $${idx++}`); values.push(location); }
    if (headline !== undefined) { updates.push(`headline = $${idx++}`); values.push(headline); }
    if (github_url !== undefined) { updates.push(`github_url = $${idx++}`); values.push(github_url); }
    if (linkedin_url !== undefined) { updates.push(`linkedin_url = $${idx++}`); values.push(linkedin_url); }
    if (website_url !== undefined) { updates.push(`website_url = $${idx++}`); values.push(website_url); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, email, role, avatar, phone, full_name, location, headline, github_url, linkedin_url, website_url, streak, longest_streak, theme, xp, bio, joined_at`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const userRes = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
