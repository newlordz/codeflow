import { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
  Terminal,
  FileCode,
  Sparkles,
  Check,
  Award,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { runCode, runChallengeTests } from '../utils/challengeRunner';

export default function ChallengeEditor({
  initialCode = '',
  starterCode = '',
  language = 'JavaScript',
  testCases = [],
  hint = '',
  onPassAll = () => {},
  isCompleted = false,
}) {
  const [code, setCode] = useState(initialCode || starterCode || getDefaultBoilerplate(language));
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'console'
  const [running, setRunning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" or "Submit & Run Tests" to execute.');
  const [testResults, setTestResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (starterCode && !code) {
      setCode(starterCode);
    }
  }, [starterCode]);

  // Handle Tab key in code editor
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCode(starterCode || getDefaultBoilerplate(language));
      setTestResults(null);
      setConsoleOutput('Code reset to default starter template.');
      toast.success('Code reset to template');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunOnly = async () => {
    setRunning(true);
    setActiveTab('console');
    try {
      const res = await runCode(code, language);
      setConsoleOutput(res.output);
      if (res.success) {
        toast.success('Code executed successfully');
      } else {
        toast.error('Execution error');
      }
    } catch (err) {
      setConsoleOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitTests = async () => {
    setTesting(true);
    setActiveTab('tests');
    try {
      const suite = await runChallengeTests(code, testCases, language);
      setTestResults(suite);

      if (suite.allPassed) {
        toast.success('All tests passed! 50 XP awarded!', { icon: '🎉' });
        onPassAll();
      } else {
        toast.error(`${suite.passedTests} of ${suite.totalTests} tests passed. Check the results below!`, { icon: '⚠️' });
      }
    } catch (err) {
      toast.error(`Test evaluation failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const lineCount = Math.max(code.split('\n').length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#21262d] text-sky-400 font-mono font-medium border border-[#30363d]">
            <FileCode size={13} />
            <span>{language || 'JavaScript'}</span>
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
              <CheckCircle2 size={12} /> Solved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-2.5 py-1 rounded-md text-amber-400 hover:bg-amber-400/10 border border-amber-400/20 transition-colors flex items-center gap-1"
              title="Need a hint?"
            >
              <Sparkles size={13} />
              <span>Hint</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
            title="Reset code"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Optional Hint Drawer */}
      {showHint && hint && (
        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-300">Challenge Hint: </span>
            <span>{hint}</span>
          </div>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="relative flex-1 min-h-[260px] flex font-mono text-sm bg-[#0d1117] overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 py-3 bg-[#090d13] text-[#484f58] select-none text-right pr-3 text-xs leading-6 border-r border-[#21262d]">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          className="flex-1 p-3 bg-transparent text-[#c9d1d9] resize-none outline-none leading-6 font-mono text-xs md:text-sm selection:bg-blue-500/30 overflow-y-auto"
          placeholder="Write your code solution here..."
        />
      </div>

      {/* Output / Tests Panel Header Tabs */}
      <div className="flex items-center justify-between px-3 bg-[#161b22] border-t border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'tests'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Test Suite</span>
            {testResults && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                testResults.allPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {testResults.passedTests}/{testResults.totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'console'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={13} />
            <span>Console</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Tab key indents by 2 spaces
        </span>
      </div>

      {/* Bottom Output Content Area */}
      <div className="h-44 bg-[#090d13] p-3 overflow-y-auto font-mono text-xs">
        {activeTab === 'tests' ? (
          <div>
            {!testResults ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-500">
                <Award size={24} className="mb-2 opacity-40 text-primary" />
                <p>Run your tests to verify your solution against the challenge requirements.</p>
                <p className="text-[11px] mt-1 text-slate-600">Passing all tests marks the lesson complete and awards XP.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#21262d]">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    testResults.allPassed ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {testResults.allPassed ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {testResults.allPassed ? 'All Test Cases Passed! ✨' : 'Some Tests Failed'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {testResults.passedTests} / {testResults.totalTests} passed
                  </span>
                </div>

                {testResults.results.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                      t.passed
                        ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/25 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {t.passed ? (
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{t.name}</p>
                        {!t.passed && (
                          <div className="mt-1 text-[11px] text-rose-300 font-mono">
                            <span className="opacity-75">Actual: </span>
                            <span>{String(t.actual)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                      {t.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {consoleOutput}
          </pre>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="flex items-center justify-between gap-3 p-3 bg-[#161b22] border-t border-[#30363d]">
        <button
          onClick={handleRunOnly}
          disabled={running || testing}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {running ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={13} className="text-emerald-400 fill-emerald-400" />
          )}
          <span>Run Code</span>
        </button>

        <button
          onClick={handleSubmitTests}
          disabled={running || testing}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {testing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Submit & Run Tests</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function getDefaultBoilerplate(lang = '') {
  const l = (lang || '').toLowerCase();
  if (l.includes('python')) {
    return `# CodeFlow Interactive Python Lab\n\ndef solution():\n    # Write your solution below\n    message = "Hello, CodeFlow!"\n    print(message)\n    return message\n\nsolution()\n`;
  }
  if (l.includes('sql')) {
    return `-- CodeFlow Interactive SQL Lab\n-- Write your query below\nSELECT title, level, language \nFROM courses \nWHERE level = 'Beginner';\n`;
  }
  if (l.includes('typescript')) {
    return `// CodeFlow Interactive TypeScript Lab\ninterface User {\n  name: string;\n  score: number;\n}\n\nfunction calculateScore(user: User): number {\n  return user.score * 2;\n}\n\nconsole.log(calculateScore({ name: "Alice", score: 50 }));\n`;
  }
  if (l.includes('go')) {
    return `package main\n\nimport "fmt"\n\nfunc main() {\n    // CodeFlow Go Lab\n    fmt.Println("Hello from Go!")\n}\n`;
  }
  return `// CodeFlow Interactive JavaScript Lab\n\nfunction solution() {\n  // Write your code here\n  const greeting = "Hello, CodeFlow!";\n  console.log(greeting);\n  return greeting;\n}\n\nsolution();\n`;
}
