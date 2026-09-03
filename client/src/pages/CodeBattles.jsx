import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Bot,
  Zap,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Send,
  Code2,
  BookOpen,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import GlassPanel from '../components/GlassPanel';
import { runJavaScriptTests } from '../utils/challengeRunner';

const TRACK_CONFIGS = [
  { id: 'python', label: 'Python', icon: '🐍', ext: 'solution.py', comment: '# Write your Python solution here...' },
  { id: 'javascript', label: 'JavaScript', icon: '⚡', ext: 'solution.js', comment: '// Write your JavaScript solution here...' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷', ext: 'solution.ts', comment: '// Write your TypeScript solution here...' },
  { id: 'sql', label: 'SQL', icon: '🗄️', ext: 'query.sql', comment: '-- Write your SQL query here...' },
  { id: 'c++', label: 'C++', icon: '⚙️', ext: 'solution.cpp', comment: '// Write your C++ solution here...' },
];

const DEFAULT_PYTHON_CHALLENGES = [
  {
    id: 'battle-py-reverse-words',
    title: 'Reverse Words in String',
    difficulty: 'easy',
    time_limit: 180,
    language: 'python',
    file_name: 'solution.py',
    description: 'Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The returned string should only have a single space separating the words.',
    starter_code: 'def reverse_words(s: str) -> str:\n    # Your code here\n    pass',
    test_cases: [
      { input: 'reverse_words("the sky is blue")', expected: '"blue is sky the"' },
      { input: 'reverse_words("  hello world  ")', expected: '"world hello"' },
      { input: 'reverse_words("a good   example")', expected: '"example good a"' }
    ]
  },
  {
    id: 'battle-py-two-sum',
    title: 'Two Sum Target',
    difficulty: 'medium',
    time_limit: 240,
    language: 'python',
    file_name: 'solution.py',
    description: 'Given a list of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    starter_code: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass',
    test_cases: [
      { input: 'two_sum([2, 7, 11, 15], 9)', expected: '[0, 1]' },
      { input: 'two_sum([3, 2, 4], 6)', expected: '[1, 2]' },
      { input: 'two_sum([3, 3], 6)', expected: '[0, 1]' }
    ]
  },
  {
    id: 'battle-py-valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    time_limit: 180,
    language: 'python',
    file_name: 'solution.py',
    description: 'Given a string `s` containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    starter_code: 'def is_valid(s: str) -> bool:\n    # Your code here\n    pass',
    test_cases: [
      { input: 'is_valid("()")', expected: 'True' },
      { input: 'is_valid("()[]{}")', expected: 'True' },
      { input: 'is_valid("(]")', expected: 'False' }
    ]
  },
  {
    id: 'battle-py-fizzbuzz',
    title: 'FizzBuzz Multiplier Array',
    difficulty: 'easy',
    time_limit: 150,
    language: 'python',
    file_name: 'solution.py',
    description: 'Write a function that returns a list of string representations of numbers from 1 to `n`. For multiples of 3 return "Fizz", multiples of 5 return "Buzz", and multiples of both return "FizzBuzz".',
    starter_code: 'def fizz_buzz(n: int) -> list[str]:\n    # Your code here\n    pass',
    test_cases: [
      { input: 'fizz_buzz(3)', expected: '["1", "2", "Fizz"]' },
      { input: 'fizz_buzz(5)', expected: '["1", "2", "Fizz", "4", "Buzz"]' },
      { input: 'fizz_buzz(15)', expected: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]' }
    ]
  },
  {
    id: 'battle-py-palindrome',
    title: 'Alphanumeric Palindrome',
    difficulty: 'easy',
    time_limit: 150,
    language: 'python',
    file_name: 'solution.py',
    description: 'A phrase is a palindrome if, after removing non-alphanumerics and lowercasing, it reads the same forward and backward.',
    starter_code: 'def is_palindrome(s: str) -> bool:\n    # Your code here\n    pass',
    test_cases: [
      { input: 'is_palindrome("A man, a plan, a canal: Panama")', expected: 'True' },
      { input: 'is_palindrome("race a car")', expected: 'False' },
      { input: 'is_palindrome(" ")', expected: 'True' }
    ]
  }
];

export default function CodeBattles() {
  const { get, post } = useApi();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState(DEFAULT_PYTHON_CHALLENGES);
  const [stats, setStats] = useState({ battlesWon: 12, totalBattles: 14, battleXp: 1250, winRate: 86 });
  const [loading, setLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('python');
  const [enrolledLanguages, setEnrolledLanguages] = useState([]);
  const [primaryCourseTitle, setPrimaryCourseTitle] = useState('');

  // Active Battle State
  const [inBattle, setInBattle] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [botDifficulty, setBotDifficulty] = useState('adept'); // 'novice' | 'adept' | 'master'
  const [userCode, setUserCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [botProgress, setBotProgress] = useState(0);
  const [userPassedCount, setUserPassedCount] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [battleResult, setBattleResult] = useState(null); // 'victory' | 'defeat' | 'timeout'
  const [testing, setTesting] = useState(false);

  const timerRef = useRef(null);
  const botIntervalRef = useRef(null);

  // Load challenges based on enrolled courses
  const loadChallenges = async (targetLang = null) => {
    setLoading(true);
    try {
      const url = targetLang ? `/battles/challenges?language=${targetLang}` : '/battles/challenges';
      const data = await get(url);

      if (data?.challenges && data.challenges.length > 0) {
        setChallenges(data.challenges);
      }
      if (data?.activeLanguage) {
        setActiveLanguage(data.activeLanguage.toLowerCase());
      }
      if (data?.enrolledLanguages) {
        setEnrolledLanguages(data.enrolledLanguages);
      }
      if (data?.primaryCourseTitle) {
        setPrimaryCourseTitle(data.primaryCourseTitle);
      }
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to load battle challenges:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [get]);

  // Handle countdown and Bot progression during active battle
  useEffect(() => {
    if (!inBattle || battleResult) return;

    // 1. Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleBattleEnd('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Bot progress simulation based on chosen difficulty
    const botStepInterval = botDifficulty === 'master' ? 1200 : botDifficulty === 'adept' ? 2200 : 3500;
    botIntervalRef.current = setInterval(() => {
      setBotProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(botIntervalRef.current);
          handleBattleEnd('defeat');
          return 100;
        }
        return next;
      });
    }, botStepInterval);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(botIntervalRef.current);
    };
  }, [inBattle, battleResult, botDifficulty]);

  const handleSwitchLanguage = (langId) => {
    setActiveLanguage(langId);
    loadChallenges(langId);
  };

  const startBattle = (challenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starter_code || '');
    setTimeLeft(challenge.time_limit || 180);
    setBotProgress(0);
    setUserPassedCount(0);
    setTestResults([]);
    setBattleResult(null);
    setInBattle(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBattleEnd = async (result) => {
    setBattleResult(result);
    clearInterval(timerRef.current);
    clearInterval(botIntervalRef.current);

    if (result === 'victory') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (_) {}

      toast.success('⚔️ VICTORY! FlowBot defeated!', { icon: '🏆' });
      try {
        await post('/battles/submit', {
          challengeId: selectedChallenge?.id,
          won: true,
          timeTaken: (selectedChallenge?.time_limit || 180) - timeLeft,
          code: userCode,
          language: selectedChallenge?.language || activeLanguage,
        });
        setStats((prev) => ({
          ...prev,
          battlesWon: prev.battlesWon + 1,
          totalBattles: prev.totalBattles + 1,
          battleXp: prev.battleXp + 100,
        }));
      } catch (err) {
        console.error('Submit battle error:', err);
      }
    } else {
      toast.error('Duel ended! FlowBot was faster this round.');
    }
  };

  const runTests = async () => {
    if (!selectedChallenge) return;
    setTesting(true);

    try {
      const data = await post('/battles/test', {
        challengeId: selectedChallenge.id,
        code: userCode,
        language: selectedChallenge.language || activeLanguage,
        testCases: selectedChallenge.test_cases,
      });

      setUserPassedCount(data.passedCount || 0);
      setTestResults(data.results || []);

      if (data.passed) {
        handleBattleEnd('victory');
      } else {
        toast.error(`${data.passedCount || 0}/${data.totalCount || selectedChallenge.test_cases.length} tests passed. Keep coding!`);
      }
    } catch (err) {
      // Fallback to local evaluation for JavaScript if offline
      if (selectedChallenge.language === 'javascript') {
        const local = runJavaScriptTests(userCode, selectedChallenge.test_cases);
        setUserPassedCount(local.passedCount);
        setTestResults(local.results);
        if (local.passed) handleBattleEnd('victory');
        else toast.error(`${local.passedCount}/${local.totalCount} tests passed.`);
      } else {
        toast.error(`Execution error: ${err.message || 'Failed to run tests'}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentTrackConfig = TRACK_CONFIGS.find((t) => t.id === activeLanguage) || TRACK_CONFIGS[0];

  // ==========================================
  // VIEW 1: ACTIVE BATTLE ARENA
  // ==========================================
  if (inBattle && selectedChallenge) {
    const totalTests = selectedChallenge.test_cases?.length || 1;
    const userPercent = Math.round((userPassedCount / totalTests) * 100);
    const challengeLang = (selectedChallenge.language || activeLanguage).toUpperCase();
    const fileName = selectedChallenge.file_name || currentTrackConfig.ext;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 pb-16"
      >
        {/* Battle HUD Top Bar */}
        <div className="glass-panel shadow-premium rounded-3xl p-5 border-primary/30 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Swords size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-on-surface">1v1 Code Duel in Progress</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                    {challengeLang}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">
                  Target: Solve the challenge before FlowBot AI reaches 100%
                </p>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container/80 border border-outline-variant/30 text-amber-400 font-mono font-bold text-lg self-start md:self-auto shadow-inner">
              <Clock size={18} className="animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Versus Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/20">
            {/* Player Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  You ({user?.username || 'Challenger'})
                </span>
                <span className="text-emerald-400 font-bold">{userPassedCount}/{totalTests} Tests ({userPercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-outline-variant/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  animate={{ width: `${userPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* FlowBot AI Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <Bot size={13} className="text-rose-400 animate-pulse" />
                  FlowBot AI ({botDifficulty.toUpperCase()})
                </span>
                <span className="text-rose-400 font-bold">{botProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-outline-variant/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                  animate={{ width: `${botProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duel Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Problem Description & Test Results (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel shadow-premium rounded-2xl p-6 border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {selectedChallenge.difficulty.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-on-surface-variant font-semibold">
                  {currentTrackConfig.icon} {challengeLang} Track
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">{selectedChallenge.title}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4 whitespace-pre-wrap">
                {selectedChallenge.description}
              </p>

              <div className="border-t border-outline-variant/20 pt-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                  Test Case Assertions
                </h4>
                <div className="space-y-2">
                  {selectedChallenge.test_cases.map((tc, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-xs font-mono">
                      <div className="text-primary truncate">{tc.input}</div>
                      <div className="text-on-surface-variant mt-0.5">
                        Expected: <span className="text-emerald-400">{tc.expected}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Results Output */}
            {testResults.length > 0 && (
              <div className="glass-panel shadow-premium rounded-2xl p-5 border-outline-variant/30">
                <h4 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-bold mb-3 flex items-center justify-between">
                  <span>Live Evaluation Results</span>
                  <span className="text-primary">{userPassedCount}/{totalTests} Passed</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {testResults.map((r, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                        r.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {r.passed ? <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" /> : <XCircle size={15} className="mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold">{r.input}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Output: {r.actual} &bull; Expected: {r.expected}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Code Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel shadow-premium rounded-2xl overflow-hidden border-outline-variant/30">
              <div className="px-5 py-3 bg-surface-container/80 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5 font-semibold">
                  <Code2 size={14} className="text-primary" />
                  <span>{fileName}</span>
                </span>
                <button
                  onClick={() => setUserCode(selectedChallenge.starter_code || '')}
                  className="text-xs font-mono text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
                  title="Reset code"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={16}
                spellCheck="false"
                className="w-full p-4 font-mono text-sm bg-slate-950/80 text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-primary/30"
                placeholder={currentTrackConfig.comment}
              />

              <div className="p-4 bg-surface-container/60 border-t border-outline-variant/20 flex items-center justify-between">
                <button
                  onClick={() => setInBattle(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Surrender Duel
                </button>

                <button
                  onClick={runTests}
                  disabled={testing}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap size={14} />
                  <span>{testing ? 'Testing Code...' : 'Submit & Test Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Victory / Defeat Modal */}
        <AnimatePresence>
          {battleResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full text-center space-y-4 border-outline-variant/40 shadow-2xl relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl ${
                  battleResult === 'victory'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30'
                    : 'bg-gradient-to-br from-rose-500 to-amber-500 shadow-rose-500/30'
                }`}>
                  {battleResult === 'victory' ? <Trophy size={32} /> : <Swords size={32} />}
                </div>

                <h3 className="text-2xl font-black text-on-surface">
                  {battleResult === 'victory' ? 'VICTORY!' : 'DUEL FINISHED'}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {battleResult === 'victory'
                    ? `Brilliant work! You completed "${selectedChallenge.title}" in ${challengeLang} before FlowBot AI. +100 Battle XP added to your profile!`
                    : 'FlowBot AI was faster this time. Review your logic and challenge the bot again for redemption!'}
                </p>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => setInBattle(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                  >
                    Return to Arena Lobby
                  </button>
                  <button
                    onClick={() => startBattle(selectedChallenge)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs btn-primary shadow-md flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Rematch Bot</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ==========================================
  // VIEW 2: CODE BATTLES LOBBY
  // ==========================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-16"
    >
      {/* Lobby Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold mb-2">
            <Swords size={14} className="text-rose-400" />
            <span>Real-Time Speed Duel Arena</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface">
            Code Battles: 1-on-1 Duel
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 max-w-2xl">
            Test your problem solving velocity against <strong>FlowBot AI</strong> in high-stakes algorithmic races tailored to your enrolled language!
          </p>
        </div>

        {/* AI Opponent Speed Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-container/60 border border-outline-variant/30 backdrop-blur-sm self-start md:self-auto">
          {[
            { id: 'novice', label: 'Novice Bot', speed: 'Easy' },
            { id: 'adept', label: 'Adept Bot', speed: 'Medium' },
            { id: 'master', label: 'Master Bot', speed: 'Hard' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setBotDifficulty(lvl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                botDifficulty === lvl.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Language Track Bar (Tailored to user's enrolled course!) */}
      <div className="glass-panel p-4 rounded-2xl border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white shadow-md shadow-primary/25 flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">
                {enrolledLanguages.length > 0 ? 'Enrolled Track Battles' : 'Explore Battle Tracks'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <Check size={10} />
                Dynamic Curriculum
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
              {primaryCourseTitle
                ? `Active enrolled track: ${primaryCourseTitle} (${activeLanguage.toUpperCase()})`
                : `Active duel track: ${activeLanguage.toUpperCase()}`}
            </p>
          </div>
        </div>

        {/* Track Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {TRACK_CONFIGS.map((track) => {
            const isEnrolled = enrolledLanguages.some((l) => l.toLowerCase() === track.id);
            const isActive = activeLanguage === track.id;

            return (
              <button
                key={track.id}
                onClick={() => handleSwitchLanguage(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : isEnrolled
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'text-on-surface-variant hover:text-on-surface bg-surface-container/80 border border-outline-variant/30'
                }`}
              >
                <span>{track.icon}</span>
                <span>{track.label}</span>
                {isEnrolled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="You are enrolled in this track" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duel Combat Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel shadow-premium p-4 md:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-xs font-mono uppercase">Duels Won</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-on-surface font-mono">{stats.battlesWon}</span>
          <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">Victories</span>
        </div>

        <div className="glass-panel shadow-premium p-4 md:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-xs font-mono uppercase">Win Rate</span>
            <Flame size={16} className="text-rose-400 fill-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-rose-400 font-mono">{stats.winRate}%</span>
          <span className="text-[10px] font-mono text-on-surface-variant block mt-0.5">Global duel precision</span>
        </div>

        <div className="glass-panel shadow-premium p-4 md:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-xs font-mono uppercase">Duel XP</span>
            <Zap size={16} className="text-primary" />
          </div>
          <span className="text-2xl font-extrabold text-primary font-mono">{stats.battleXp}</span>
          <span className="text-[10px] font-mono text-primary/80 block mt-0.5">+100 XP per victory</span>
        </div>

        <div className="glass-panel shadow-premium p-4 md:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-xs font-mono uppercase">Active Track</span>
            <Shield size={16} className="text-indigo-400" />
          </div>
          <span className="text-lg font-bold text-on-surface mt-1 block capitalize">
            {currentTrackConfig.icon} {activeLanguage}
          </span>
          <span className="text-[10px] font-mono text-indigo-400 block">
            {enrolledLanguages.some((l) => l.toLowerCase() === activeLanguage) ? 'Enrolled Track' : 'Practice Track'}
          </span>
        </div>
      </div>

      {/* Challenges Arena Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Swords size={18} className="text-primary" />
            <span>{currentTrackConfig.icon} {activeLanguage.toUpperCase()} Arena Challenges ({challenges.length})</span>
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">
            Click any challenge card to duel FlowBot
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => (
            <div
              key={c.id}
              onClick={() => startBattle(c)}
              className="glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-primary/50 transition-all group cursor-pointer hover:shadow-lg shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        c.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {c.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {c.language.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                    <Clock size={12} /> {c.time_limit}s
                  </span>
                </div>

                <h4 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-1.5">
                  {c.title}
                </h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                <span className="text-xs font-mono text-primary flex items-center gap-1 font-semibold group-hover:underline">
                  <Play size={12} /> Start Duel
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">+100 XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
