import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Curated library of rapid-fire duel challenges
const battleChallenges = [
  {
    id: 'battle-reverse-words',
    title: 'Reverse Words in String',
    difficulty: 'easy',
    time_limit: 180, // seconds
    language: 'javascript',
    description: 'Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The returned string should only have a single space separating the words.',
    starter_code: 'function reverseWords(s) {\n  // Your code here\n  \n}',
    test_cases: [
      { input: 'reverseWords("the sky is blue")', expected: 'blue is sky the' },
      { input: 'reverseWords("  hello world  ")', expected: 'world hello' },
      { input: 'reverseWords("a good   example")', expected: 'example good a' }
    ]
  },
  {
    id: 'battle-two-sum',
    title: 'Two Sum Target',
    difficulty: 'medium',
    time_limit: 240,
    language: 'javascript',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution.',
    starter_code: 'function twoSum(nums, target) {\n  // Your code here\n  \n}',
    test_cases: [
      { input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' },
      { input: 'twoSum([3,2,4], 6)', expected: '[1,2]' },
      { input: 'twoSum([3,3], 6)', expected: '[0,1]' }
    ]
  },
  {
    id: 'battle-valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    time_limit: 180,
    language: 'javascript',
    description: 'Given a string `s` containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
    starter_code: 'function isValid(s) {\n  // Your code here\n  \n}',
    test_cases: [
      { input: 'isValid("()")', expected: 'true' },
      { input: 'isValid("()[]{}")', expected: 'true' },
      { input: 'isValid("(]")', expected: 'false' },
      { input: 'isValid("([)]")', expected: 'false' }
    ]
  },
  {
    id: 'battle-fizzbuzz-multiplier',
    title: 'FizzBuzz Multiplier Array',
    difficulty: 'easy',
    time_limit: 150,
    language: 'javascript',
    description: 'Write a function that returns an array of string representations of numbers from 1 to `n`. For multiples of 3 return "Fizz", multiples of 5 return "Buzz", and multiples of both 3 and 5 return "FizzBuzz".',
    starter_code: 'function fizzBuzz(n) {\n  // Your code here\n  \n}',
    test_cases: [
      { input: 'fizzBuzz(3)', expected: '["1","2","Fizz"]' },
      { input: 'fizzBuzz(5)', expected: '["1","2","Fizz","4","Buzz"]' },
      { input: 'fizzBuzz(15)', expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
    ]
  },
  {
    id: 'battle-palindrome-checker',
    title: 'Alphanumeric Palindrome',
    difficulty: 'easy',
    time_limit: 150,
    language: 'javascript',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    starter_code: 'function isPalindrome(s) {\n  // Your code here\n  \n}',
    test_cases: [
      { input: 'isPalindrome("A man, a plan, a canal: Panama")', expected: 'true' },
      { input: 'isPalindrome("race a car")', expected: 'false' },
      { input: 'isPalindrome(" ")', expected: 'true' }
    ]
  }
];

// 1. Get available battle challenges
router.get('/challenges', authMiddleware, async (req, res) => {
  try {
    const userRes = await query('SELECT xp, streak FROM users WHERE id = $1', [req.user.id]);
    const userStats = userRes.rows[0] || { xp: 0, streak: 0 };

    res.json({
      challenges: battleChallenges,
      stats: {
        battlesWon: Math.floor((userStats.xp || 0) / 100),
        totalBattles: Math.floor((userStats.xp || 0) / 80) + 1,
        battleXp: userStats.xp || 0,
        winRate: 85
      }
    });
  } catch (err) {
    console.error('Battle challenges error:', err);
    res.status(500).json({ error: 'Failed to fetch battle challenges' });
  }
});

// 2. Submit battle result
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { challengeId, won, timeTaken, code } = req.body;
    const challenge = battleChallenges.find(c => c.id === challengeId);

    const xpReward = won ? 100 : 25;

    // Credit XP to user
    await query('UPDATE users SET xp = COALESCE(xp, 0) + $1 WHERE id = $2', [xpReward, req.user.id]);

    // Log activity
    await query(
      'INSERT INTO activities (user_id, action, description, metadata) VALUES ($1, $2, $3, $4)',
      [
        req.user.id,
        'battle',
        `${won ? 'Won' : 'Completed'} Code Battle: "${challenge?.title || 'Speed Duel'}"`,
        JSON.stringify({ challengeId, won, timeTaken, xpReward })
      ]
    );

    // Notify user
    if (won) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.id,
          '⚔️ Battle Victory!',
          `You conquered FlowBot in "${challenge?.title || 'Speed Duel'}" (+${xpReward} Battle XP)!`,
          'achievement',
          '/battles'
        ]
      );
    }

    res.json({
      success: true,
      won,
      xpEarned: xpReward,
      message: won ? `Victory! +${xpReward} XP awarded` : `Duel finished! +${xpReward} XP for effort`
    });
  } catch (err) {
    console.error('Battle submit error:', err);
    res.status(500).json({ error: 'Failed to submit battle' });
  }
});

export default router;
