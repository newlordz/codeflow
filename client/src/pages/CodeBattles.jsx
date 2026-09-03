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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import GlassPanel from '../components/GlassPanel';
import { runJavaScriptTests } from '../utils/challengeRunner';

export default function CodeBattles() {
  const { get, post } = useApi();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({ battlesWon: 12, totalBattles: 14, battleXp: 1250, winRate: 86 });
  const [loading, setLoading] = useState(true);

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
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const botIntervalRef = useRef(null);

  useEffect(() => {
    async function fetchBattleData() {
      try {
        const data = await get('/battles/challenges');
        if (data?.challenges) {
          setChallenges(data.challenges);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load battle data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBattleData();
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

  const startBattle = (challenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starter_code || '');
    setTimeLeft(challenge.time_limit || 180);
    setBotProgress(0);
    setUserPassedCount(0);
    setTestResults([]);
    setBattleResult(null);
    setInBattle(true);
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

  const runTests = () => {
    if (!selectedChallenge) return;
    const { passed, passedCount, totalCount, results } = runJavaScriptTests(
      userCode,
      selectedChallenge.test_cases
    );
    setUserPassedCount(passedCount);
    setTestResults(results);

    if (passed) {
      handleBattleEnd('victory');
    } else {
      toast.error(`${passedCount}/${totalCount} tests passed. Keep coding!`);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 shimmer h-44" />
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: ACTIVE BATTLE ARENA
  // ==========================================
  if (inBattle && selectedChallenge) {
    const totalTests = selectedChallenge.test_cases?.length || 1;
    const userPercent = Math.round((userPassedCount / totalTests) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 pb-16"
      >
        {/* Battle HUD Top Bar */}
        <div className="glass-panel shadow-premium rounded-3xl p-5 border-primary/30 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            {/* Player Side (Left) */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25 flex-shrink-0">
                {(user?.username || 'You').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface truncate">{user?.username || 'You'}</span>
                  <span className="text-xs font-mono font-bold text-primary">{userPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${userPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant block mt-1">
                  Tests: {userPassedCount}/{totalTests} passed
                </span>
              </div>
            </div>

            {/* VS Crest + Timer (Center) */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 shadow-inner">
                <Clock size={14} className={timeLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
                <span className={`text-base font-extrabold font-mono tracking-wider ${timeLeft < 30 ? 'text-rose-400' : 'text-on-surface'}`}>
                  {formatTimer(timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Swords size={14} className="text-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Speed Duel Arena
                </span>
              </div>
            </div>

            {/* FlowBot Side (Right) */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-400 flex items-center gap-1 truncate">
                    <Bot size={15} /> FlowBot AI ({botDifficulty})
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">{botProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                    style={{ width: `${botProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant block mt-1 text-right">
                  AI Solution Progression
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/25 flex-shrink-0">
                <Bot size={24} />
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
                <span className="text-xs font-mono text-on-surface-variant">JavaScript ES6</span>
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
                  <span>Evaluation Results</span>
                  <span className="text-primary">{userPassedCount}/{totalTests} Passed</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {testResults.map((r, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                        r.passed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {r.passed ? <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <XCircle size={15} className="text-rose-400 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{r.input}</div>
                        {!r.passed && (
                          <div className="text-[11px] opacity-80 mt-0.5">
                            Expected {r.expected}, got {r.actual}
                          </div>
                        )}
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
                <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5">
                  <Code2 size={14} className="text-primary" />
                  <span>solution.js</span>
                </span>
                <button
                  onClick={() => setUserCode(selectedChallenge.starter_code || '')}
                  className="text-xs font-mono text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
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
                placeholder="// Write your solution here..."
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
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <Zap size={14} />
                  <span>Submit &amp; Test Code</span>
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
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`glass-panel shadow-premium rounded-3xl p-8 max-w-md w-full text-center border-2 ${
                  battleResult === 'victory' ? 'border-amber-400 bg-slate-950/95' : 'border-rose-500/40 bg-slate-950/95'
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl ${
                    battleResult === 'victory'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/40'
                      : 'bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-500/40'
                  }`}
                >
                  {battleResult === 'victory' ? <Trophy size={40} /> : <XCircle size={40} />}
                </div>

                <h3 className="text-2xl font-extrabold text-on-surface mb-1">
                  {battleResult === 'victory' ? 'Duel Victory!' : 'Defeated in Combat'}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  {battleResult === 'victory'
                    ? `You successfully defeated FlowBot AI in "${selectedChallenge.title}" with speed and precision!`
                    : 'FlowBot crossed the finish line before you. Hone your algorithmic speed and rematch!'}
                </p>

                {battleResult === 'victory' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-bold text-sm mb-6">
                    <Sparkles size={16} />
                    <span>+100 Battle XP Awarded</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => startBattle(selectedChallenge)}
                    className="glass-panel py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Rematch
                  </button>
                  <button
                    onClick={() => setInBattle(false)}
                    className="btn-primary py-2.5 rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Back to Lobby
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
            Test your problem solving velocity against <strong>FlowBot AI</strong> in high-stakes algorithmic races. Win duels to claim +100 XP!
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
            <span className="text-xs font-mono uppercase">Combat Class</span>
            <Shield size={16} className="text-indigo-400" />
          </div>
          <span className="text-lg font-bold text-on-surface mt-1 block">Speed Striker</span>
          <span className="text-[10px] font-mono text-indigo-400 block">Tier II Duelist</span>
        </div>
      </div>

      {/* Challenges Arena Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Swords size={18} className="text-primary" />
          <span>Active Arena Challenges</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => (
            <GlassPanel
              key={c.id}
              className="p-5 flex flex-col justify-between hover:border-primary/40 transition-all group cursor-pointer"
              hover
              onClick={() => startBattle(c)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      c.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {c.difficulty.toUpperCase()}
                  </span>
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

              <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between">
                <span className="text-[11px] font-mono text-primary font-semibold">
                  +100 XP Bounty
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Enter Duel</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
