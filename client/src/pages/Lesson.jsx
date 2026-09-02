import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
  StickyNote,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import ProgressBar from '../components/ProgressBar';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const data = await get(`/lessons/${id}`);
        setLesson(data.lesson || data);
      } catch {
        setLesson({
          id,
          title: 'Variables & Data Types',
          course_title: 'Python Mastery',
          description: 'Learn about Python variables, strings, integers, floats, booleans, and how to work with different data types.',
          content: `<h2>Variables & Data Types</h2><p>In Python, variables are containers for storing data values. Python is dynamically typed.</p><pre><code>name = "Alice"\nage = 25\nheight = 5.8\nis_student = True\n\nprint(type(name))  # str\nprint(type(age))   # int</code></pre>`,
          video_url: 'https://example.com/video/python-variables',
          transcript: 'In this lesson we cover variables and data types in Python. Variables are names that refer to stored values. The main data types are strings, integers, floats, and booleans.',
          completed: false,
          prev_lesson: { id: '101', title: 'Welcome to Python' },
          next_lesson: { id: '103', title: 'Control Flow' },
          order_num: 2,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [id, get]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await post(`/lessons/${id}/complete`);
      setLesson((prev) => ({ ...prev, completed: true }));
      toast.success('Lesson completed! Keep up the great work!', { icon: '🎉' });
    } catch (err) {
      toast.error(err.message || 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.error('Please write a note first');
      return;
    }
    setSavingNote(true);
    try {
      await post('/notes', { lesson_id: id, course_id: lesson?.course_id, content: note });
      toast.success('Note saved!');
      setNote('');
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 glass-panel shimmer rounded" />
        <div className="glass-panel rounded-xl p-8 shimmer h-96" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Lesson not found</p>
      </div>
    );
  }

  const contentHtml = lesson.content || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/courses/${lesson.course_id}`)}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {lesson.course_title || 'Course'}
        </button>
        <div className="flex items-center gap-2">
          {lesson.prev_lesson && (
            <button
              onClick={() => navigate(`/lessons/${lesson.prev_lesson.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs glass-panel text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
            >
              <ArrowLeft size={14} /> Previous
            </button>
          )}
          {lesson.next_lesson && (
            <button
              onClick={() => navigate(`/lessons/${lesson.next_lesson.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs glass-panel text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
            >
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel shadow-premium rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip">
                Lesson {lesson.order_num || '?'}
              </span>
              {lesson.duration && (
                <span className="flex items-center gap-1 text-xs font-mono text-on-surface-variant">
                  <Clock size={12} /> {lesson.duration}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface display-tight mb-2">{lesson.title}</h1>
            <p className="text-sm text-on-surface-variant mb-5">{lesson.description}</p>

            {lesson.completed && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-success/10 border border-secondary/20 text-secondary rounded-lg text-sm font-medium mb-4 shadow-glow-effect-secondary">
                <CheckCircle size={16} />
                Lesson completed
              </div>
            )}

            {lesson.video_url && (
              <div className="mb-6">
                {!videoPlaying ? (
                  <div
                    className="relative aspect-video rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex items-center justify-center cursor-pointer group overflow-hidden"
                    onClick={() => setVideoPlaying(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                      <Play size={30} className="text-white ml-1" />
                    </div>
                    <div className="absolute bottom-4 left-4 text-sm text-on-surface font-medium">
                      Watch Tutorial
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mx-auto mb-3">
                        <Play size={28} className="text-white ml-1" />
                      </div>
                      <p className="text-on-surface font-medium">Video Player</p>
                      <p className="text-xs text-on-surface-variant mt-1">Tutorial video would play here</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm btn-ghost text-on-surface-variant rounded-full"
              >
                {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Transcript
              </button>
              {showTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-5 bg-surface-container-lowest/60 rounded-xl border border-outline-variant/10"
                >
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {lesson.transcript || 'No transcript available for this lesson.'}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="divider-premium my-6" />

            <div
              className="lesson-prose"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-outline-variant/10">
              <div className="text-xs text-on-surface-variant font-mono">
                {lesson.completed ? 'Status: Completed' : 'Status: In Progress'}
              </div>
              <button
                onClick={handleComplete}
                disabled={completing || lesson.completed}
                className={`btn-primary px-6 py-2.5 text-sm ${
                  lesson.completed ? 'opacity-70 cursor-default' : ''
                }`}
              >
                {completing ? (
                  'Saving...'
                ) : lesson.completed ? (
                  <>
                    <CheckCircle size={16} /> Completed
                  </>
                ) : (
                  'Mark Complete'
                )}
              </button>
            </div>
          </div>

          {lesson.completed && (
            <div className="glass-panel rounded-2xl p-6 border-secondary/30 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-success shadow-glow-effect-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-on-surface font-semibold mb-1">Amazing work!</h3>
                  <p className="text-sm text-on-surface-variant">
                    {[
                      'You are building real skills that will change your career!',
                      'Consistency is the key to mastery. And you have got it!',
                      'Small steps every day lead to giant leaps. You are doing amazing!',
                      'Another lesson mastered! Your future self is proud of you.',
                    ][Math.floor(Math.random() * 4)]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/25 flex items-center justify-center">
                <StickyNote size={14} className="text-white" />
              </div>
              My Notes
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Take notes for this lesson..."
              rows={5}
              className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-lg p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !note.trim()}
              className="btn-primary w-full py-2 text-xs mt-3"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              Navigation
            </h3>
            <div className="space-y-1">
              {lesson.prev_lesson && (
                <button
                  onClick={() => navigate(`/lessons/${lesson.prev_lesson.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-high transition-colors text-left"
                >
                  <ArrowLeft size={14} className="text-on-surface-variant" />
                  <div className="min-w-0">
                    <p className="text-xs text-on-surface-variant">Previous</p>
                    <p className="text-sm text-on-surface truncate">{lesson.prev_lesson.title}</p>
                  </div>
                </button>
              )}
              {lesson.next_lesson && (
                <button
                  onClick={() => navigate(`/lessons/${lesson.next_lesson.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-high transition-colors text-left"
                >
                  <ArrowRight size={14} className="text-on-surface-variant" />
                  <div className="min-w-0">
                    <p className="text-xs text-on-surface-variant">Next</p>
                    <p className="text-sm text-on-surface truncate">{lesson.next_lesson.title}</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
