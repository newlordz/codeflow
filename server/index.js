import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load environment variables from .env
try {
  const envCandidates = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server/.env'),
  ];
  for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envFile);
      } else {
        const lines = fs.readFileSync(envFile, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
      break;
    }
  }
} catch {
  // Continue even if .env reading fails
}

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import lessonsRoutes from './routes/lessons.js';
import quizzesRoutes from './routes/quizzes.js';
import notesRoutes from './routes/notes.js';
import notificationsRoutes from './routes/notifications.js';
import qaRoutes from './routes/qa.js';
import streaksRoutes from './routes/streaks.js';
import certificatesRoutes from './routes/certificates.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import runnerRoutes from './routes/runner.js';
import aiRoutes from './routes/ai.js';
import leaderboardRoutes from './routes/leaderboard.js';
import battleRoutes from './routes/battles.js';
import { authMiddleware } from './middleware/auth.js';
const clientDist = path.join(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/runner', runnerRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/courses', authMiddleware, coursesRoutes);
app.use('/api/lessons', authMiddleware, lessonsRoutes);
app.use('/api/quizzes', authMiddleware, quizzesRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);
app.use('/api/qa', authMiddleware, qaRoutes);
app.use('/api/streaks', authMiddleware, streaksRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/leaderboard', authMiddleware, leaderboardRoutes);
app.use('/api/battles', authMiddleware, battleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

async function start() {
  // Trigger auto-restart
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`CodeFlow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
