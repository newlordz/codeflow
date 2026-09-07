import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import CodeEditor from '../components/CodeEditor';
import { useApi } from '../hooks/useApi';
import { soundEngine } from '../utils/soundEngine';

export default function MockInterview() {
  const { post } = useApi();
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [track, setTrack] = useState('frontend');
  const [level, setLevel] = useState('mid');
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [scorecard, setScorecard] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (interviewStarted && !scorecard) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStarted, scorecard]);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const handleStartInterview = async () => {
    try {
      const data = await post('/interview/start', { track, level });
      setQuestion(data.question);
      setCode(data.question.starterCode);
      setTimeLeft(data.question.duration || 1800);
      setMessages([
        {
          id: 'intro',
          role: 'interviewer',
          name: 'Sarah (Staff SWE)',
          text: data.initialInterviewerMessage,
          time: 'Just now'
        }
      ]);
      setInterviewStarted(true);
      soundEngine.playSuccess();
      toast.success('Mock Interview Started! Good luck.', { icon: '🎯' });

      if (voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
        speakText(data.initialInterviewerMessage);
      }
    } catch {
      toast.error('Could not initialize interview session.');
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, 'Code snippet.').replace(/[`*#]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      name: 'You',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      // Call AI mentor route with interview context
      const data = await post('/ai/chat', {
        prompt,
        code,
        language: 'JavaScript',
        context: `Technical Mock Interview for ${track} (${level} level): Problem "${question?.title}"`,
        action: 'chat',
        history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text }))
      });

      const reply = data.response || 'That sounds like a valid line of thinking. How would you test that edge case?';
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'interviewer',
        name: 'Sarah (Staff SWE)',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(reply);
    } catch {
      const fallback = "I see your point. Let's make sure the edge cases are covered. How would your code handle empty inputs or large scale?";
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'interviewer', name: 'Sarah (Staff SWE)', text: fallback, time: 'Just now' }
      ]);
      speakText(fallback);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSubmitInterview = async () => {
    setIsEvaluating(true);
    try {
      const res = await post('/interview/evaluate', {
        track,
        level,
        code,
        messagesCount: messages.length,
        timeRemaining: timeLeft
      });
      setScorecard(res);
      soundEngine.playLevelUp();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {
      toast.error('Could not generate evaluation scorecard.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-[#222a3d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              AI Mock Technical Interviewer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                FAANG Simulation
              </span>
            </h1>
            <p className="text-xs text-slate-300">Live technical interview with real-time feedback & hiring scorecard</p>
          </div>
        </div>

        {interviewStarted && (
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
              timeLeft < 300
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-[#121829] border-[#222a3d] text-white'
            }`}>
              <Clock size={14} className="text-blue-400" />
              <span>Time Remaining: {timeDisplay}</span>
            </div>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                voiceEnabled ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-[#121829] border-[#222a3d] text-slate-400'
              }`}
              title={voiceEnabled ? 'Interviewer Voice: ON' : 'Interviewer Voice: OFF'}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={handleSubmitInterview}
              disabled={isEvaluating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
            >
              <CheckCircle2 size={15} />
              <span>Finish & Evaluate</span>
            </button>
          </div>
        )}
      </div>

      {!interviewStarted ? (
        /* Configuration Setup Card */
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0e1424] border border-[#222a3d] shadow-2xl space-y-6 text-slate-200">
          <div className="space-y-1 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-white">Select Your Interview Track</h2>
            <p className="text-xs text-slate-400">Choose the role and difficulty level you want to practice for.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Technical Domain</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'frontend', label: 'Frontend SWE', desc: 'React, JS & DOM' },
                  { id: 'backend', label: 'Backend SWE', desc: 'APIs, Rate Limits & Systems' },
                  { id: 'algo', label: 'Algorithms', desc: 'Data Structures & Big-O' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrack(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      track === t.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-[#121829] border-[#222a3d] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">{t.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Target Seniority</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'junior', label: 'Junior (L3)' },
                  { id: 'mid', label: 'Mid-Level (L4)' },
                  { id: 'senior', label: 'Senior FAANG (L5)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`py-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      level === l.id
                        ? 'bg-indigo-600/25 border-indigo-400 text-white'
                        : 'bg-[#121829] border-[#222a3d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <span>Begin Mock Interview</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Active Interview Split Arena */
        <div className="grid lg:grid-cols-12 gap-4 h-[600px]">
          {/* Left Column: AI Interviewer Chat (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0e1424] border border-[#222a3d] flex flex-col overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-[#121829] border-b border-[#222a3d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Staff SWE @ CodeFlow</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                Listening
              </span>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-mono text-slate-500 mb-1">{m.name} &bull; {m.time}</span>
                    <div className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-[#151c2e] border border-[#222a3d] text-slate-200 rounded-tl-xs'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {isAiThinking && (
                <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#151c2e] border border-[#222a3d] text-slate-400 text-xs w-fit">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono text-slate-400 ml-1">Interviewer is formulating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#121829] border-t border-[#222a3d] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask clarifying questions or explain your approach..."
                className="flex-1 bg-[#090d16] border border-[#222a3d] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiThinking}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Right Column: Whiteboard Code Editor (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0e1424] border border-[#222a3d] flex flex-col overflow-hidden shadow-xl">
            {/* Problem Details Bar */}
            <div className="px-4 py-3 bg-[#121829] border-b border-[#222a3d] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 size={14} className="text-blue-400" />
                  {question?.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                  {question?.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{question?.description}</p>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 bg-[#070a10]">
              <CodeEditor
                language="javascript"
                value={code}
                onChange={(val) => setCode(val || '')}
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Post-Interview Scorecard Modal */}
      <AnimatePresence>
        {scorecard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#0e1424] border border-[#2b354d] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-200"
            >
              {/* Verdict Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-1">
                  <Award size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Technical Interview Evaluation</h2>
                <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md">
                  Verdict: {scorecard.verdict} ({scorecard.totalScore}/10)
                </div>
              </div>

              {/* Category Scores */}
              <div className="space-y-3 bg-[#131b2e] p-4 rounded-xl border border-[#222a3d]">
                {Object.values(scorecard.categories).map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="text-white font-mono">{cat.score}/{cat.max}</span>
                    </div>
                    <div className="w-full h-2 bg-[#0a0f1d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${(cat.score / cat.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">
                  Key Strengths
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {scorecard.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setScorecard(null);
                    setInterviewStarted(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  Start New Interview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
