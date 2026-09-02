import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Clock, HelpCircle, CheckCircle, XCircle, ChevronRight, Filter } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

const difficulties = ['All', 'easy', 'intermediate', 'advanced'];

const difficultyConfig = {
  easy: { label: 'Easy', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  intermediate: { label: 'Intermediate', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  advanced: { label: 'Advanced', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
};

const fallbackQuizzes = [
  { id: 1, title: 'Python Fundamentals Quiz', course_title: 'Python Mastery', difficulty: 'easy', questions: { length: 10 }, time_limit: 300, attempts: 1, best_score: 85, passed: 1 },
  { id: 2, title: 'Web Development Challenge', course_title: 'Web Dev Bootcamp', difficulty: 'intermediate', questions: { length: 10 }, time_limit: 600, attempts: 0, best_score: null, passed: null },
  { id: 3, title: 'Machine Learning Mastery', course_title: 'AI Foundations', difficulty: 'advanced', questions: { length: 10 }, time_limit: 900, attempts: 1, best_score: 65, passed: 0 },
  { id: 4, title: 'React Development Quiz', course_title: 'React & Modern Frontend', difficulty: 'intermediate', questions: { length: 10 }, time_limit: 600, attempts: 2, best_score: 90, passed: 1 },
  { id: 5, title: 'Algorithms & Data Structures', course_title: 'Data Structures & Algorithms', difficulty: 'advanced', questions: { length: 10 }, time_limit: 900, attempts: 0, best_score: null, passed: null },
  { id: 6, title: 'SQL Fundamentals', course_title: 'SQL & Database Design', difficulty: 'easy', questions: { length: 10 }, time_limit: 300, attempts: 1, best_score: 95, passed: 1 },
];

export default function Quizzes() {
  const { get } = useApi();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await get('/quizzes');
        setQuizzes(data.quizzes || data || fallbackQuizzes);
      } catch {
        setQuizzes(fallbackQuizzes);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, [get]);

  const filtered = activeDifficulty === 'All'
    ? quizzes
    : quizzes.filter((q) => q.difficulty === activeDifficulty);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 shimmer h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <div className="inline-flex items-center gap-1.5 chip mb-4">
          <Brain size={13} />
          <span>Test your knowledge</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface mb-1">Challenge Yourself</h1>
        <p className="text-on-surface-variant">Test your knowledge and earn certificates</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => setActiveDifficulty(diff)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeDifficulty === diff
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
            }`}
          >
            {diff === 'All' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Brain size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
          <p className="text-on-surface-variant">No quizzes found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((quiz, i) => {
            const dConfig = difficultyConfig[quiz.difficulty] || difficultyConfig.intermediate;
            const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : (typeof quiz.questions === 'string' ? JSON.parse(quiz.questions).length : 10);
            const minutes = Math.round((quiz.time_limit || 600) / 60);
            const attempted = quiz.attempts > 0;
            const passed = quiz.passed === 1 || quiz.passed === true;

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassPanel className="p-5 hover:border-primary/30 transition-all duration-300" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${dConfig.bg} ${dConfig.text}`}>
                      {dConfig.label}
                    </div>
                    {attempted && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono ${passed ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                        {passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {passed ? 'Passed' : 'Failed'}
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-on-surface mb-1">{quiz.title}</h3>
                  <p className="text-xs text-on-surface-variant mb-4">{quiz.course_title || quiz.description}</p>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono mb-4">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} /> {questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {minutes} min
                    </span>
                    {attempted && quiz.best_score != null && (
                      <span className="flex items-center gap-1">
                        <Brain size={12} /> {quiz.best_score}%
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className={`w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      attempted
                        ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-xs'
                    }`}
                  >
                    {attempted ? (passed ? 'Retake Quiz' : 'Try Again') : 'Take Quiz'}
                    <ChevronRight size={14} />
                  </Link>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
