import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// In-memory active collaborative study rooms
const rooms = new Map();

// Helper to generate a 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CF-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Create a new collaboration room
router.post('/create', authMiddleware, (req, res) => {
  const { initialCode = '', language = 'python' } = req.body;
  const roomCode = generateRoomCode();

  const room = {
    code: roomCode,
    language,
    content: initialCode,
    updatedAt: Date.now(),
    host: req.user?.username || 'Host',
    participants: [
      {
        id: req.user?.id,
        username: req.user?.username || 'Host',
        avatar: req.user?.avatar || null,
        color: '#38bdf8',
        lastSeen: Date.now(),
      }
    ]
  };

  rooms.set(roomCode, room);

  res.json({
    success: true,
    roomCode,
    room,
  });
});

// 2. Join an existing room
router.post('/join', authMiddleware, (req, res) => {
  const { roomCode } = req.body;
  if (!roomCode) {
    return res.status(400).json({ error: 'Room code required' });
  }

  const cleanCode = roomCode.trim().toUpperCase();
  const room = rooms.get(cleanCode);

  if (!room) {
    return res.status(404).json({ error: 'Room not found or session has ended' });
  }

  // Add participant if not already present
  const existingIdx = room.participants.findIndex(p => p.id === req.user?.id);
  const colors = ['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ec4899'];
  const assignedColor = colors[room.participants.length % colors.length];

  if (existingIdx === -1) {
    room.participants.push({
      id: req.user?.id,
      username: req.user?.username || 'Guest',
      avatar: req.user?.avatar || null,
      color: assignedColor,
      lastSeen: Date.now(),
    });
  } else {
    room.participants[existingIdx].lastSeen = Date.now();
  }

  res.json({
    success: true,
    roomCode: cleanCode,
    room,
  });
});

// 3. Sync code changes
router.post('/sync', authMiddleware, (req, res) => {
  const { roomCode, content, language } = req.body;
  const cleanCode = (roomCode || '').trim().toUpperCase();
  const room = rooms.get(cleanCode);

  if (!room) {
    return res.status(404).json({ error: 'Room expired' });
  }

  if (content !== undefined) {
    room.content = content;
    room.updatedAt = Date.now();
  }
  if (language) {
    room.language = language;
  }

  // Update participant heartbeat
  const participant = room.participants.find(p => p.id === req.user?.id);
  if (participant) {
    participant.lastSeen = Date.now();
  }

  res.json({
    success: true,
    room,
  });
});

// 4. Poll room state
router.get('/room/:code', authMiddleware, (req, res) => {
  const cleanCode = req.params.code.trim().toUpperCase();
  const room = rooms.get(cleanCode);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Filter inactive participants (older than 45s)
  const now = Date.now();
  room.participants = room.participants.filter(p => now - p.lastSeen < 45000);

  res.json({
    success: true,
    room,
  });
});

export default router;
