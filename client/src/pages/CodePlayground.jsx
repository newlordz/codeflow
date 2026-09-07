import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Code2,
  Terminal,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Layers,
  Users,
  Share2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import GlassPanel from '../components/GlassPanel';
import FlowAIMentor from '../components/FlowAIMentor';
import CodeVisualizer from '../components/CodeVisualizer';
import { useApi } from '../hooks/useApi';

const languages = [
  { value: 'python', label: 'Python 3.12 (Native)', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript (Node.js)', icon: '⚡' },
  { value: 'sql', label: 'PostgreSQL Query', icon: '🗄️' },
  { value: 'html', label: 'HTML5 Live Preview', icon: '🌐' },
  { value: 'css', label: 'CSS3 Live Preview', icon: '🎨' },
];

const templates = {
  python: `# Real Python 3.12 Execution
import math

def calculate_stats(numbers):
    total = sum(numbers)
    avg = total / len(numbers)
    return {
        "count": len(numbers),
        "sum": total,
        "average": round(avg, 2),
        "sqrt_max": round(math.sqrt(max(numbers)), 2)
    }

data = [12, 45, 78, 23, 56, 89, 90]
print("--- Computing Python Stats ---")
stats = calculate_stats(data)
for key, value in stats.items():
    print(f"{key.capitalize()}: {value}")

print("\\nTesting list comprehension:")
evens = [x for x in data if x % 2 == 0]
print(f"Even numbers: {evens}")
`,

  javascript: `// Real Node.js JavaScript Execution
const users = [
  { name: 'Ada Lovelace', role: 'Pioneer', xp: 4500 },
  { name: 'Alan Turing', role: 'Cryptanalyst', xp: 5200 },
  { name: 'Grace Hopper', role: 'Compiler Inventor', xp: 4900 },
];

console.log("=== Developers Leaderboard ===");
const sorted = users.sort((a, b) => b.xp - a.xp);

sorted.forEach((u, i) => {
  console.log(\`#\${i + 1} \${u.name.padEnd(16)} | Role: \${u.role.padEnd(18)} | XP: \${u.xp}\`);
});

const totalXp = users.reduce((sum, u) => sum + u.xp, 0);
console.log(\`\\nCombined Academy XP: \${totalXp.toLocaleString()}\`);
`,

  sql: `-- Real PostgreSQL Query Execution
-- Explore available academy courses
SELECT 
  title, 
  language, 
  level, 
  duration, 
  lessons_count, 
  enrolled_count 
FROM courses 
ORDER BY order_num ASC;
`,

  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e1b4b);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      max-width: 380px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 16px;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>CodeFlow Live View</h1>
    <p>This code is rendered in real time. Modify the HTML/CSS and click Run to update!</p>
    <button onclick="alert('Hello from interactive HTML!')">Click Me</button>
  </div>
</body>
</html>
`,

  css: `/* CSS Live Playground */
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: radial-gradient(circle at center, #1e293b, #0f172a);
  font-family: sans-serif;
}

.box {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  animation: pulse 2s infinite alternate ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.9) rotate(0deg); }
  100% { transform: scale(1.1) rotate(15deg); }
}
`,
};

export default function CodePlayground() {
  const { post } = useApi();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(templates['python']);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'preview' | 'visualizer'
  const [htmlPreviewCode, setHtmlPreviewCode] = useState(templates['html']);
  const [showAiMentor, setShowAiMentor] = useState(false);
  const [collabRoom, setCollabRoom] = useState(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  // Collaboration Heartbeat & Code Sync
  useEffect(() => {
    if (!collabRoom?.code) return;
    const interval = setInterval(async () => {
      try {
        const res = await post('/collab/sync', {
          roomCode: collabRoom.code,
          content: code,
          language
        });
        if (res?.room?.participants) {
          setCollabRoom((prev) => ({ ...prev, participants: res.room.participants }));
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [collabRoom?.code, code, language, post]);

  const handleCreateRoom = async () => {
    try {
      const res = await post('/collab/create', { initialCode: code, language });
      if (res?.roomCode) {
        setCollabRoom(res.room);
        setShowCollabModal(false);
        toast.success(`Pair Room Live: ${res.roomCode}`, { icon: '🤝' });
      }
    } catch {
      toast.error('Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomInput.trim()) return;
    try {
      const res = await post('/collab/join', { roomCode: joinRoomInput.trim() });
      if (res?.room) {
        setCollabRoom(res.room);
        if (res.room.content) setCode(res.room.content);
        if (res.room.language) setLanguage(res.room.language);
        setShowCollabModal(false);
        toast.success(`Connected to room ${res.roomCode}!`, { icon: '🚀' });
      }
    } catch (err) {
      toast.error(err.message || 'Could not find active room.');
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(templates[lang]);
    setOutput('');
    setDuration(null);
    if (lang === 'html' || lang === 'css') {
      setActiveTab('preview');
      setHtmlPreviewCode(lang === 'html' ? templates['html'] : `<style>${templates['css']}</style><div class="box"></div>`);
    } else {
      setActiveTab('console');
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setDuration(null);

    // If HTML or CSS, update the live preview
    if (language === 'html' || language === 'css') {
      const previewPayload = language === 'html' ? code : `<style>${code}</style><div class="box"></div>`;
      setHtmlPreviewCode(previewPayload);
      setActiveTab('preview');
      setOutput('HTML/CSS rendered successfully in Live Preview tab.');
      setIsSuccess(true);
      setDuration(12);
      setRunning(false);
      return;
    }

    try {
      const res = await post('/runner/execute', { language, code });
      setOutput(res.output || 'Code executed successfully (no output).');
      setIsSuccess(res.success !== false);
      if (res.duration) setDuration(res.duration);
    } catch (err) {
      setOutput(`Execution error: ${err.message || 'Failed to reach runner'}`);
      setIsSuccess(false);
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    setOutput('');
    setDuration(null);
  };

  const handleReset = () => {
    setCode(templates[language]);
    setOutput('');
    setDuration(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold mb-2">
            <Sparkles size={13} />
            <span>Native Compiler & Execution Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface mb-1">
            Code Playground
          </h1>
          <p className="text-on-surface-variant text-sm">
            Execute real Python 3.12, Node.js JavaScript, and live PostgreSQL queries directly with sub-second execution.
          </p>
        </div>
      </div>

      <div className="glass-panel shadow-premium rounded-2xl p-5 md:p-6">
        {/* Playground Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-semibold uppercase text-on-surface-variant hidden sm:inline">
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono font-semibold"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-ghost px-3 py-2 text-xs rounded-xl flex items-center gap-1.5"
              title="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleReset}
              className="btn-ghost px-3 py-2 text-xs rounded-xl flex items-center gap-1.5"
              title="Reset to Template"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setShowAiMentor(true)}
              className="px-3.5 py-2 text-xs rounded-xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 hover:from-blue-600/25 hover:to-purple-600/25 text-sky-400 border border-blue-500/30 font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              title="Ask FlowAI Code Mentor"
            >
              <Bot size={14} className="text-primary" />
              <span>Ask FlowAI</span>
            </button>
            <button
              onClick={() => setShowCollabModal(true)}
              className={`px-3.5 py-2 text-xs rounded-xl border font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                collabRoom
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/30'
              }`}
              title="Live Collaborative Pair Programming"
            >
              <Users size={14} className={collabRoom ? 'text-emerald-400' : 'text-primary'} />
              <span>{collabRoom ? `Room: ${collabRoom.code} (${collabRoom.participants?.length || 1})` : 'Pair Code'}</span>
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="btn-primary px-5 py-2 text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              {running ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={14} className="fill-white" />
              )}
              <span className="font-bold">{running ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Editor & Output Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Code Editor */}
          <div className="h-[520px] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-outline-variant/20">
              <span className="text-xs font-mono font-semibold text-on-surface-variant uppercase flex items-center gap-1.5">
                <Code2 size={14} className="text-primary" /> Source Code ({language})
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant/60">
                UTF-8
              </span>
            </div>
            <div className="flex-1 bg-slate-950">
              <CodeEditor
                language={language === 'sql' ? 'sql' : language === 'html' ? 'html' : language === 'css' ? 'css' : language}
                value={code}
                onChange={(val) => setCode(val || '')}
                height="475px"
              />
            </div>
          </div>

          {/* Right: Output & Live Preview */}
          <div className="h-[520px] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm flex flex-col">
            {/* Terminal Header Tabs */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'console'
                      ? 'bg-surface text-primary border border-outline-variant/30'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Terminal size={13} /> Console Output
                </button>

                <button
                  onClick={() => setActiveTab('visualizer')}
                  className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'visualizer'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Layers size={13} className="text-blue-400" /> Visualizer
                </button>

                {(language === 'html' || language === 'css') && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-surface text-primary border border-outline-variant/30'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Eye size={13} /> Live Preview
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {duration !== null && (
                  <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                    <Clock size={11} /> {duration}ms
                  </span>
                )}
                {output && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {isSuccess ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    {isSuccess ? 'Success' : 'Error'}
                  </span>
                )}
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  title="Clear Console"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 bg-slate-950 text-slate-100 overflow-auto relative">
              {activeTab === 'visualizer' ? (
                <div className="h-full">
                  <CodeVisualizer customCode={code} customLanguage={language} />
                </div>
              ) : activeTab === 'console' ? (
                output ? (
                  <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed selection:bg-primary/30">
                    {output}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Terminal size={32} className="text-slate-700 mb-2" />
                    <p className="text-slate-400 text-xs font-mono">
                      {running ? 'Executing in native runner...' : 'Click "Run Code" to compile and execute.'}
                    </p>
                    <p className="text-slate-600 text-[11px] font-mono mt-1">
                      Supports Python 3, Node.js scripts, and live SQL database queries.
                    </p>
                  </div>
                )
              ) : (
                <iframe
                  title="Live Preview"
                  srcDoc={htmlPreviewCode}
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white border-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over FlowAI Code Mentor Drawer */}
      <FlowAIMentor
        isOpen={showAiMentor}
        onClose={() => setShowAiMentor(false)}
        currentCode={code}
        language={languages.find((l) => l.value === language)?.label || language}
        contextTitle="Code Playground"
        onApplyCode={(c) => setCode(c)}
      />

      {/* Collaborative Pairing Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0f1422] border border-[#2b354d] rounded-2xl p-6 shadow-2xl space-y-5 text-slate-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Live Pair Programming</h3>
                    <p className="text-[11px] text-slate-400">Share code buffer in real-time with a peer</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCollabModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {collabRoom ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#141b2e] border border-emerald-500/30 text-center space-y-2">
                    <span className="text-xs text-slate-400 block font-mono">ACTIVE ROOM CODE</span>
                    <span className="text-2xl font-mono font-extrabold text-emerald-400 tracking-wider">
                      {collabRoom.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(collabRoom.code);
                        toast.success('Room code copied!');
                      }}
                      className="text-[11px] text-sky-400 hover:underline block mx-auto font-mono"
                    >
                      Copy Room Code
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">Connected Coders:</span>
                    <div className="flex flex-wrap gap-2">
                      {collabRoom.participants?.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-[#141b2e] border border-[#2b354d] text-xs font-mono text-white flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#38bdf8' }} />
                          {p.username}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCollabRoom(null);
                      toast('Left pair room session.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Disconnect Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} />
                    <span>Create Instant Study Room</span>
                  </button>

                  <div className="flex items-center gap-2 my-2 text-[11px] text-slate-500 font-mono justify-center">
                    <span className="h-px bg-[#2b354d] flex-1" />
                    <span>OR JOIN EXISTING ROOM</span>
                    <span className="h-px bg-[#2b354d] flex-1" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                      placeholder="Enter Code (e.g. CF-9481)"
                      className="flex-1 bg-[#090d16] border border-[#2b354d] rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono placeholder:normal-case outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
