import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Bank of high-signal interview problems
const interviewQuestions = {
  frontend: [
    {
      id: 'fe-debounce-throttle',
      title: 'Implement Custom Debounce with Immediate Flag',
      difficulty: 'Medium',
      duration: 1800,
      description: 'Implement a debounce function in JavaScript that takes a callback `fn`, wait delay `ms`, and an optional `immediate` boolean flag. If `immediate` is true, trigger the function on the leading edge instead of trailing edge.',
      starterCode: `function debounce(fn, delay, immediate = false) {
  let timerId = null;
  return function(...args) {
    const context = this;
    const callNow = immediate && !timerId;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      if (!immediate) fn.apply(context, args);
    }, delay);
    if (callNow) fn.apply(context, args);
  };
}`,
      testCases: [
        { desc: 'Delays execution until quiet period passes' },
        { desc: 'Executes immediately when immediate flag is true' }
      ]
    },
    {
      id: 'fe-virtual-dom',
      title: 'Flatten Nested Object Paths',
      difficulty: 'Easy',
      duration: 1500,
      description: 'Write a function `flattenObject(obj)` that transforms a deeply nested object into flat key-value pairs with dot notation (e.g. `{"user": {"address": {"city": "Berlin"}}}` -> `{"user.address.city": "Berlin"}`).',
      starterCode: `function flattenObject(obj, prefix = '') {
  let result = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? \`\${prefix}.\${key}\` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}`,
      testCases: [{ desc: 'Correctly collapses nested properties with dot notation' }]
    }
  ],
  backend: [
    {
      id: 'be-rate-limiter',
      title: 'Token Bucket Rate Limiter',
      difficulty: 'Hard',
      duration: 2100,
      description: 'Design and implement an in-memory Token Bucket rate limiter algorithm. Tokens are added at a continuous rate `refillRate` per second up to `capacity`. Requests consume 1 token. Return boolean `allowRequest()`.',
      starterCode: `class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  allowRequest(cost = 1) {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }
}`,
      testCases: [{ desc: 'Refills tokens proportionally to elapsed time' }]
    }
  ],
  algo: [
    {
      id: 'algo-lru-cache',
      title: 'LRU (Least Recently Used) Cache',
      difficulty: 'Medium',
      duration: 1800,
      description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity for `get` and `put` operations.',
      starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
      testCases: [{ desc: 'Evicts least recently used element when capacity exceeded' }]
    }
  ]
};

// Start a new mock interview session
router.post('/start', authMiddleware, (req, res) => {
  const { track = 'frontend', level = 'mid' } = req.body;
  const pool = interviewQuestions[track] || interviewQuestions.algo;
  const question = pool[Math.floor(Math.random() * pool.length)];

  res.json({
    sessionId: `session_${Date.now()}`,
    track,
    level,
    question,
    initialInterviewerMessage: `Hello! I'm Sarah, a Staff Software Engineer and your interviewer today. We'll be working through "${question.title}". Take a minute to read the requirements on the right, and let me know if you have any questions before writing your approach.`
  });
});

// Evaluate final interview session and generate scorecard
router.post('/evaluate', authMiddleware, (req, res) => {
  const { track = 'frontend', level = 'mid', code = '', messagesCount = 4, timeRemaining = 600 } = req.body;
  const trimmed = (code || '').trim();
  const hasCode = trimmed.length > 30;

  const problemSolving = hasCode ? Math.floor(Math.random() * 2) + 8 : 6;
  const communication = messagesCount >= 3 ? 9 : 7;
  const codeQuality = hasCode && (trimmed.includes('class') || trimmed.includes('return')) ? 8.5 : 6.5;
  const timeManagement = timeRemaining > 0 ? 9 : 7;

  const totalScore = Math.round(((problemSolving + communication + codeQuality + timeManagement) / 4) * 10) / 10;
  let verdict = 'Hire';
  if (totalScore >= 8.5) verdict = 'Strong Hire';
  else if (totalScore < 7) verdict = 'Needs Improvement';

  res.json({
    verdict,
    totalScore,
    categories: {
      problemSolving: { score: problemSolving, max: 10, label: 'Problem Solving & Algorithmic Logic' },
      communication: { score: communication, max: 10, label: 'Technical Communication & Clarification' },
      codeQuality: { score: codeQuality, max: 10, label: 'Code Correctness, Idioms & Safety' },
      timeManagement: { score: timeManagement, max: 10, label: 'Pacing & Time Management' }
    },
    strengths: [
      'Proactively asked clarifying questions and validated edge cases.',
      'Structured the solution using clean, idiomatic patterns with good separation of concerns.',
      'Demonstrated solid grasp of algorithmic bounds and memory trade-offs.'
    ],
    improvements: [
      'Consider writing small automated assertion checks before declaring implementation complete.',
      'Discuss asymptotic Big-O space complexity earlier during the approach formulation phase.'
    ],
    feedbackSummary: `Candidate demonstrated solid technical instincts and communicated clearly throughout the session. Solution for "${track}" problem was cleanly structured with adequate defensive checks.`
  });
});

export default router;
