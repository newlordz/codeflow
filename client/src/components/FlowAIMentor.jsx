import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Lightbulb,
  Bug,
  Zap,
  HelpCircle,
  RotateCcw,
  Code2,
  Copy,
  Check,
  ArrowDownToLine,
  Volume2,
  VolumeX,
  FileCode,
  CheckCircle2,
  ListRestart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';

export default function FlowAIMentor({
  isOpen = false,
  onClose = () => {},
  currentCode = '',
  language = 'Python',
  contextTitle = 'Lesson',
  onApplyCode = null,
}) {
  const { post, get } = useApi();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Hi! I'm FlowAI, your personal coding mentor powered by Google Gemini.\n\nI'm ready to assist you with **${language}** on **${contextTitle}**.\n\nAsk me anything about your code, or tap one of the quick actions below!`,
      timestamp: 'Just now',
      model: 'Gemini 3.6 Flash'
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('Gemini 3.6 Flash');
  const [speakingId, setSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch AI server status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await get('/ai/status');
        if (data?.model) {
          setActiveModel(data.model.includes('3.6') ? 'Gemini 3.6 Flash' : data.model);
        }
      } catch {
        // Silent fallback
      }
    }
    if (isOpen) {
      checkStatus();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, get]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up speech synthesis on close
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isOpen]);

  const handleSend = async (customAction = null, customPrompt = '') => {
    const action = customAction || 'chat';
    const userPrompt = customPrompt || input.trim();

    if (!userPrompt && !customAction) return;

    const displayContent = customAction
      ? getActionLabel(customAction)
      : userPrompt;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare history snapshot before adding the new message
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    if (!customAction) setInput('');
    setLoading(true);

    try {
      const data = await post('/ai/chat', {
        prompt: userPrompt,
        code: currentCode,
        language,
        context: contextTitle,
        action,
        history: historyPayload,
      });

      const aiReply = data.response || 'I analyzed your code, but could not generate a response.';
      const usedModel = data.model || activeModel;
      if (data.model) setActiveModel(data.model);

      const aiMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: aiReply,
        model: usedModel,
        action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ **Unable to reach FlowAI service**: ${err.message || 'Please check your connection and try again.'}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `### 🔄 Session Cleared\n\nI'm ready with fresh context for your **${language}** code. Ask a question or use the quick chips below!`,
        timestamp: 'Just now',
        model: activeModel
      },
    ]);
    toast.success('Chat history cleared', { icon: '🧹' });
  };

  const toggleSpeak = (id, text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text for speech
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*>\-_~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
        {/* Backdrop for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto sm:hidden"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full sm:w-[480px] md:w-[540px] h-full bg-[#0d1117] border-l border-[#30363d] shadow-2xl flex flex-col pointer-events-auto z-50 text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#161b22] border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/25 flex items-center justify-center text-white relative">
                <Bot size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#161b22] rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white leading-none">FlowAI Mentor</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 font-semibold">
                    <Sparkles size={10} className="text-blue-400" />
                    {activeModel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <span className="text-primary font-semibold">{language}</span>
                  <span>&bull;</span>
                  <span className="truncate max-w-[200px]" title={contextTitle}>
                    {contextTitle}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
                title="Clear conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
                title="Close mentor"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12161f] border-b border-[#30363d] overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSend('explain')}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Lightbulb size={13} />
              <span>Explain Code</span>
            </button>

            <button
              onClick={() => handleSend('debug')}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Bug size={13} />
              <span>Debug / Check</span>
            </button>

            <button
              onClick={() => handleSend('hint')}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <HelpCircle size={13} />
              <span>Get Hint</span>
            </button>

            <button
              onClick={() => handleSend('optimize')}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Zap size={13} />
              <span>Optimize</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#090d13] text-xs md:text-sm">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              const isLatestAssistant = !isUser && idx === messages.length - 1;

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-xs">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl p-4 leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-[#161b22] text-slate-200 border border-[#30363d] rounded-tl-xs shadow-md'
                    }`}
                  >
                    {/* Render message body with interactive Markdown formatting */}
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-sans text-xs md:text-[13px]">
                        {m.content}
                      </p>
                    ) : (
                      <MarkdownRenderer
                        content={m.content}
                        onApplyCode={onApplyCode}
                      />
                    )}

                    {/* Message footer metadata & interactive controls */}
                    <div
                      className={`text-[10px] mt-2 font-mono flex items-center justify-between gap-2 pt-1 border-t ${
                        isUser
                          ? 'border-white/15 text-blue-200'
                          : 'border-[#30363d]/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{m.timestamp}</span>
                        {m.model && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px]">
                            {m.model}
                          </span>
                        )}
                      </div>

                      {!isUser && m.id !== 'welcome' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSpeak(m.id, m.content)}
                            className={`p-1 rounded transition-colors ${
                              speakingId === m.id
                                ? 'text-blue-400 bg-blue-500/20'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title={speakingId === m.id ? 'Stop audio' : 'Read aloud'}
                          >
                            {speakingId === m.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>
                          <CopyMessageButton content={m.content} />
                        </div>
                      )}
                    </div>

                    {/* Interactive Follow-up Suggestion Chips for latest AI response */}
                    {isLatestAssistant && !loading && (
                      <div className="mt-3 pt-2.5 border-t border-[#30363d]/70 flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono w-full block">
                          Suggested next questions:
                        </span>
                        {getSuggestedQuestions(m.action, language).map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSend(null, q)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-[#21262d] hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 text-slate-300 border border-[#30363d] transition-all text-left"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse shadow-md">
                  <Bot size={15} />
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-400 flex items-center gap-2.5 shadow-md">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">
                    FlowAI ({activeModel}) is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#161b22] border-t border-[#30363d]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${activeModel} about your ${language} code...`}
                disabled={loading}
                className="flex-1 bg-[#090d13] border border-[#30363d] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-md flex-shrink-0"
                title="Send question"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Clean copy button for full response
 */
function CopyMessageButton({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
      title="Copy entire response"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

/**
 * Interactive Markdown Renderer that parses code blocks, inline tags, bold/italic, lists, and headers
 */
function MarkdownRenderer({ content, onApplyCode }) {
  if (!content) return null;

  // Split content into blocks (code blocks vs text blocks)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-slate-200 text-xs md:text-[13px] leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code Block
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : '';
          const codeText = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <CodeBlockCard
              key={index}
              code={codeText}
              language={lang}
              onApplyCode={onApplyCode}
            />
          );
        }

        // Text block: parse lines for headers, lists, callouts, and inline formatting
        const textLines = part.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {textLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Headers (cleanly strips any '#*', '###**', or leading/trailing asterisks)
              const headerMatch = trimmed.match(/^(#{1,6})\s*[\*\s]*(.*?)\s*[\*\s]*$/);
              if (headerMatch && headerMatch[2]) {
                const level = headerMatch[1].length;
                const titleText = headerMatch[2].replace(/^\*+|\*+$/g, '').trim();
                if (level >= 3) {
                  return (
                    <h4 key={lIdx} className="text-sm font-bold text-white pt-1 text-sky-400 flex items-center gap-1.5">
                      {parseInlineStyles(titleText)}
                    </h4>
                  );
                }
                if (level === 2) {
                  return (
                    <h3 key={lIdx} className="text-base font-bold text-white pt-1 text-primary">
                      {parseInlineStyles(titleText)}
                    </h3>
                  );
                }
                return (
                  <h2 key={lIdx} className="text-lg font-bold text-white pt-1">
                    {parseInlineStyles(titleText)}
                  </h2>
                );
              }

              // Callout / Blockquote
              if (trimmed.startsWith('>')) {
                return (
                  <blockquote
                    key={lIdx}
                    className="border-l-2 border-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-r-lg text-slate-300 italic my-1"
                  >
                    {parseInlineStyles(trimmed.replace(/^>\s*/, ''))}
                  </blockquote>
                );
              }

              // Unordered List item
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span className="flex-1">{parseInlineStyles(trimmed.slice(2))}</span>
                  </div>
                );
              }

              // Numbered List item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                    <span className="text-[11px] font-mono font-bold text-blue-400 flex-shrink-0 w-4">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
                  </div>
                );
              }

              // Standard Paragraph
              return (
                <p key={lIdx} className="leading-relaxed">
                  {parseInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Card for code blocks with language badge, copy action, and optional inject to editor
 */
function CodeBlockCard({ code, language, onApplyCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleApply = () => {
    if (onApplyCode) {
      onApplyCode(code);
      toast.success('Code applied to your editor!', { icon: '✨' });
    }
  };

  return (
    <div className="my-2.5 rounded-xl bg-[#090d13] border border-[#30363d] overflow-hidden shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] text-[11px] font-mono">
        <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <FileCode size={13} className="text-blue-400" />
          {language || 'code'}
        </span>

        <div className="flex items-center gap-1.5">
          {onApplyCode && (
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 transition-colors"
              title="Insert into editor"
            >
              <ArrowDownToLine size={11} />
              <span>Insert into Editor</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#21262d] text-slate-300 hover:text-white hover:bg-[#30363d] transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3 overflow-x-auto text-[12px] font-mono leading-relaxed bg-[#06090e] text-slate-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

/**
 * Parses inline elements: `code`, **bold**, *italic*
 */
function parseInlineStyles(text) {
  if (!text) return text;

  // Split by inline code first
  const segments = text.split(/(`[^`]+`)/g);

  return segments.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#21262d] text-sky-300 font-mono text-[11px] border border-[#30363d]"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }

    // Parse **bold** and *italic* in remaining string
    const boldParts = seg.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={`${i}-${bIdx}`} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Check for *italic*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((itPart, itIdx) => {
        if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
          return (
            <em key={`${i}-${bIdx}-${itIdx}`} className="italic text-slate-300">
              {itPart.slice(1, -1)}
            </em>
          );
        }
        return itPart;
      });
    });
  });
}

function getActionLabel(action) {
  switch (action) {
    case 'explain':
      return '💡 Can you explain this code step-by-step?';
    case 'debug':
      return '🐞 Can you check this code for bugs, errors, or anti-patterns?';
    case 'hint':
      return '🎯 Give me a pedagogical hint without giving away the full answer!';
    case 'optimize':
      return '⚡ How can I optimize this code for better time and space complexity?';
    default:
      return action;
  }
}

function getSuggestedQuestions(action, language) {
  switch (action) {
    case 'explain':
      return [
        'Can you simplify this explanation?',
        'What is the time complexity $O(n)$?',
        'Show an alternative way to write this'
      ];
    case 'debug':
      return [
        'Show the full corrected version',
        'What edge cases could break this?',
        'How do I add unit tests for this?'
      ];
    case 'hint':
      return [
        'Give me one more subtle clue',
        'Which built-in functions can help?',
        'What data structure is best here?'
      ];
    case 'optimize':
      return [
        'Can this be done in $O(1)$ space?',
        `What are standard ${language} best practices?`,
        'Compare recursive vs iterative'
      ];
    default:
      return [
        'Can you explain this line-by-line?',
        'How would I test this function?',
        'What are common interview questions on this?'
      ];
  }
}
