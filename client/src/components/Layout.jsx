import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FlowAIMentor from './FlowAIMentor';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiMentorOpen, setAiMentorOpen] = useState(false);
  const location = useLocation();

  const isEditorPage =
    location.pathname.startsWith('/lessons/') ||
    location.pathname.startsWith('/playground');

  useEffect(() => {
    const handleOpenAi = () => setAiMentorOpen(true);
    window.addEventListener('open-global-ai-mentor', handleOpenAi);
    return () => window.removeEventListener('open-global-ai-mentor', handleOpenAi);
  }, []);

  const getContextTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/courses')) return 'Course Catalog';
    if (path.startsWith('/battles')) return 'Code Battles Arena';
    if (path.startsWith('/leaderboard')) return 'Academy Leaderboard';
    if (path.startsWith('/quizzes')) return 'Knowledge Quizzes';
    if (path.startsWith('/notes')) return 'Study Notes';
    if (path.startsWith('/certificates')) return 'Certificates';
    return 'CodeFlow Academy';
  };

  return (
    <div className="min-h-screen app-bg transition-colors duration-300">
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAi={() => setAiMentorOpen(true)}
      />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <motion.main
          className="flex-1 min-h-[calc(100vh-4rem)] ml-0 lg:ml-[260px] p-4 md:p-6 lg:p-8 transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>

      {/* Floating FlowAI Quick Launch Button on non-editor pages */}
      {!isEditorPage && (
        <motion.button
          onClick={() => setAiMentorOpen(true)}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 flex items-center gap-2 border border-white/20 text-xs md:text-sm font-semibold hover:shadow-blue-500/50 transition-all cursor-pointer group"
          title="Chat with FlowAI Mentor"
        >
          <div className="relative flex items-center justify-center">
            <Bot size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="hidden sm:inline">Ask FlowAI</span>
          <Sparkles size={14} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}

      {/* Global AI Mentor Drawer for non-editor pages */}
      {!isEditorPage && (
        <FlowAIMentor
          isOpen={aiMentorOpen}
          onClose={() => setAiMentorOpen(false)}
          currentCode=""
          language="General Programming"
          contextTitle={getContextTitle(location.pathname)}
        />
      )}
    </div>
  );
}
