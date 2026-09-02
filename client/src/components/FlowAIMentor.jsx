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
  ChevronDown,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function FlowAIMentor({
  isOpen = false,
  onClose = () => {},
  currentCode = '',
  language = 'Python',
  contextTitle = 'Lesson',
}) {
  const { post } = useApi();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Hi there! I'm FlowAI, your personal coding mentor.\n\nI'm looking at your **${language}** code for **${contextTitle}**.\n\nClick any of the quick actions below, or ask me any question about your logic!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customAction = null, customPrompt = '') => {
    const action = customAction || 'chat';
    const userPrompt = customPrompt || input.trim();

    if (!userPrompt && !customAction) return;

    const userMessage = {
      id: String(Date.now()),
      role: 'user',
      content: customAction
        ? getActionLabel(customAction)
        : userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

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
      });

      const aiMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.response || 'I analyzed your request, but could not generate a response.',
        model: data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `⚠️ **Unable to reach FlowAI service**: ${err.message || 'Please try again.'}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `### 🔄 Session Cleared\n\nI'm ready to help you with your **${language}** code. Ask a question or use the quick chips below!`,
        timestamp: 'Just now',
      },
    ]);
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto sm:hidden"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full sm:w-[440px] md:w-[480px] h-full bg-[#0d1117] border-l border-[#30363d] shadow-2xl flex flex-col pointer-events-auto z-50 text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/25 flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white leading-none">FlowAI Mentor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Context: {language} &bull; {contextTitle.slice(0, 20)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
                title="Clear chat history"
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
          <div className="flex items-center gap-2 p-3 bg-[#161b22]/50 border-b border-[#30363d] overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSend('explain')}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Lightbulb size={13} />
              <span>Explain Code</span>
            </button>

            <button
              onClick={() => handleSend('debug')}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Bug size={13} />
              <span>Debug / Check</span>
            </button>

            <button
              onClick={() => handleSend('hint')}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <HelpCircle size={13} />
              <span>Hint</span>
            </button>

            <button
              onClick={() => handleSend('optimize')}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 whitespace-nowrap flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
            >
              <Zap size={13} />
              <span>Optimize</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#090d13] text-xs md:text-sm">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white rounded-tr-xs'
                        : 'bg-[#161b22] text-slate-200 border border-[#30363d] rounded-tl-xs shadow-md'
                    }`}
                  >
                    <div className="prose-dark whitespace-pre-wrap font-sans text-xs md:text-[13px]">
                      {m.content}
                    </div>

                    <div
                      className={`text-[10px] mt-1.5 font-mono flex items-center justify-between gap-2 ${
                        isUser ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {m.model && <span className="opacity-75">{m.model}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                  <Bot size={15} />
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="font-mono text-[11px] ml-1">FlowAI is analyzing your code...</span>
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
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FlowAI about this code or lesson..."
                disabled={loading}
                className="flex-1 bg-[#090d13] border border-[#30363d] focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-xs flex-shrink-0"
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

function getActionLabel(action) {
  switch (action) {
    case 'explain':
      return '💡 Can you explain this code step-by-step?';
    case 'debug':
      return '🐞 Can you check this code for bugs or errors?';
    case 'hint':
      return '🎯 Give me a hint for this challenge without spoiling the answer!';
    case 'optimize':
      return '⚡ How can I optimize and clean up this code?';
    default:
      return action;
  }
}
