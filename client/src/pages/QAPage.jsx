import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Mail,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

export default function QAPage() {
  const { get, post } = useApi();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await get('/qa');
      setQuestions(data.questions || data || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const data = await post('/qa', { subject, message, email });
      setQuestions((prev) => [data.question || data, ...prev]);
      setSubject('');
      setMessage('');
      setEmail('');
      toast.success('Question submitted! We will respond soon.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="glass-panel rounded-xl p-6 shimmer h-48" />
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
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">Ask a Question</h1>
        <p className="text-on-surface-variant">Get help from our team of expert instructors</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GlassPanel className="p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
              <HelpCircle size={16} className="text-primary" />
              Ask a Question
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-mono">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., How do I use list comprehensions?"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-mono">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question in detail..."
                  rows={5}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all resize-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-mono flex items-center gap-1">
                  <Mail size={12} /> Email for response
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-premium px-3 py-2.5"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 text-sm shadow-xs disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Question
                  </>
                )}
              </button>
            </form>
          </GlassPanel>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-primary" />
            Your Questions
          </h3>

          {questions.length === 0 ? (
            <GlassPanel className="p-12 text-center">
              <MessageCircle size={40} className="text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-on-surface-variant">No questions yet</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Ask your first question using the form</p>
            </GlassPanel>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassPanel className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {q.answered ? (
                          <CheckCircle2 size={16} className="text-secondary" />
                        ) : (
                          <AlertCircle size={16} className="text-on-surface-variant" />
                        )}
                        <span className={`text-xs font-mono font-medium ${q.answered ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {q.answered ? 'Answered' : 'Pending'}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/60 font-mono flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-on-surface mb-1">{q.subject}</h4>
                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{q.message}</p>
                    {q.answered && q.response && (
                      <div className="p-3 bg-secondary/5 border border-secondary/10 rounded-lg">
                        <p className="text-xs font-semibold text-secondary mb-1">Response from CodeFlow Team:</p>
                        <p className="text-xs text-on-surface leading-relaxed">{q.response}</p>
                      </div>
                    )}
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
