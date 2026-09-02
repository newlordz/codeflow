import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Lock,
  ChevronRight,
  Brain,
  Play,
  Terminal,
  Globe,
  Bot,
  Layers,
  GitBranch,
  Database,
  Code2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import ProgressBar from '../components/ProgressBar';

function CourseIconTile({ icon, title }) {
  const t = (title || '').toLowerCase();
  const i = (icon || '').toLowerCase();

  let IconComp = Terminal;
  let gradient = 'from-blue-600 to-indigo-600 shadow-blue-500/25';

  if (i === 'terminal' || t.includes('python')) {
    IconComp = Terminal;
    gradient = 'from-blue-600 to-indigo-600 shadow-blue-500/25';
  } else if (i === 'language' || t.includes('web') || t.includes('bootcamp')) {
    IconComp = Globe;
    gradient = 'from-amber-500 to-orange-500 shadow-amber-500/25';
  } else if (i === 'smart_toy' || t.includes('ai') || t.includes('machine learning')) {
    IconComp = Bot;
    gradient = 'from-violet-600 to-purple-600 shadow-violet-500/25';
  } else if (i === 'code_blocks' || t.includes('react') || t.includes('frontend')) {
    IconComp = Layers;
    gradient = 'from-sky-500 to-blue-600 shadow-sky-500/25';
  } else if (i === 'account_tree' || t.includes('algorithm') || t.includes('data structure')) {
    IconComp = GitBranch;
    gradient = 'from-emerald-500 to-teal-600 shadow-emerald-500/25';
  } else if (i === 'storage' || t.includes('sql') || t.includes('database')) {
    IconComp = Database;
    gradient = 'from-rose-500 to-pink-600 shadow-rose-500/25';
  } else {
    IconComp = Code2;
    gradient = 'from-indigo-600 to-violet-600 shadow-indigo-500/25';
  }

  return (
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg flex items-center justify-center flex-shrink-0 text-white`}>
      <IconComp size={32} />
    </div>
  );
}

const lessonData = [
  { id: 101, number: 1, title: 'Introduction & Setup', duration: '15 min', completed: true },
  { id: 102, number: 2, title: 'Variables & Data Types', duration: '20 min', completed: true },
  { id: 103, number: 3, title: 'Operators & Expressions', duration: '25 min', completed: true },
  { id: 104, number: 4, title: 'Control Flow: Conditionals', duration: '30 min', completed: true },
  { id: 105, number: 5, title: 'Loops & Iterations', duration: '25 min', completed: false },
  { id: 106, number: 6, title: 'Functions & Scope', duration: '35 min', completed: false },
  { id: 107, number: 7, title: 'Lists & Arrays', duration: '30 min', completed: false },
  { id: 108, number: 8, title: 'Dictionaries & Objects', duration: '25 min', completed: false },
  { id: 109, number: 9, title: 'Working with Files', duration: '30 min', completed: false },
  { id: 110, number: 10, title: 'Error Handling', duration: '20 min', completed: false },
  { id: 111, number: 11, title: 'Modules & Packages', duration: '25 min', completed: false },
  { id: 112, number: 12, title: 'Final Project', duration: '60 min', completed: false },
];

const relatedQuizzes = [
  { id: 1, title: 'Python Basics Quiz', questions: 15, difficulty: 'Easy' },
  { id: 2, title: 'Python Intermediate Challenge', questions: 20, difficulty: 'Intermediate' },
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await get(`/courses/${id}`);
        setCourse(data.course || data);
        setLessons(data.lessons || lessonData);
      } catch {
        setCourse({
          id: Number(id),
          title: 'Python Fundamentals',
          description: 'Master Python from scratch with hands-on exercises and real-world projects. This course covers everything from basic syntax to advanced concepts.',
          language: 'Python',
          level: 'Beginner',
          lessons: 24,
          duration: '12 hours',
          enrolled: 2340,
          icon: '🐍',
          enrolledByUser: true,
          progress: 42,
        });
        setLessons(lessonData);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id, get]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await post(`/courses/${id}/enroll`);
      setCourse((prev) => ({ ...prev, enrolled: true, enrolledByUser: true, progress: 0 }));
      toast.success('Successfully enrolled! Start your first lesson below.', { icon: '🎉' });
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const [unenrolling, setUnenrolling] = useState(false);

  const handleUnenroll = async () => {
    if (!window.confirm(`Are you sure you want to drop "${course?.title}"? You can re-enroll anytime.`)) {
      return;
    }
    setUnenrolling(true);
    try {
      await post(`/courses/${id}/unenroll`);
      setCourse((prev) => ({ ...prev, enrolled: false, enrolledByUser: false, progress: 0 }));
      toast.success(`Dropped "${course?.title}". You can re-enroll anytime.`, { icon: '🗑️' });
    } catch (err) {
      toast.error(err.message || 'Failed to drop course');
    } finally {
      setUnenrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 glass-panel shimmer rounded" />
        <div className="glass-panel rounded-xl p-8 shimmer">
          <div className="h-6 w-64 bg-surface-container-high rounded mb-3" />
          <div className="h-4 w-96 bg-surface-container-high rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Course not found</p>
        <Link to="/courses" className="text-primary text-sm mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  const isEnrolled = Boolean(course.enrolled || course.enrolledByUser);
  const displayedLessons = lessons.length > 0 ? lessons : lessonData;
  const completedCount = displayedLessons.filter((l) => l.completed).length;
  const progressPercent = course.progress ?? (displayedLessons.length > 0 ? Math.round((completedCount / displayedLessons.length) * 100) : 0);
  const nextLesson = displayedLessons.find((l) => !l.completed) || displayedLessons[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-2"
      >
        <ArrowLeft size={16} />
        Back to Courses
      </button>

      <div className="glass-panel shadow-premium rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(77,142,255,0.12), transparent 70%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-start gap-6">
          <CourseIconTile icon={course.icon} title={course.title} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-surface-container border border-outline-variant/40 text-on-surface">
                {course.language}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono font-medium border border-outline-variant/15">
                {course.level}
              </span>
              {(course.enrolled || course.enrolledByUser) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                  <CheckCircle size={12} /> Enrolled
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface display-tight mb-2">{course.title}</h1>
            <p className="text-on-surface-variant leading-relaxed mb-5">{course.description}</p>

            <div className="flex flex-wrap items-center gap-5 text-sm text-on-surface-variant font-mono mb-5">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-primary" /> {lessons.length || course.lessons_count || 24} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" /> {course.duration ? course.duration.replace(/.*·\s*/, '') : '8 weeks'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-primary" /> {(course.enrolled_count || 450).toLocaleString()} students enrolled
              </span>
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant font-mono">{progressPercent}% complete</span>
                    <span className="text-on-surface-variant/60 text-xs font-mono">{completedCount}/{displayedLessons.length} lessons</span>
                  </div>
                  <ProgressBar value={progressPercent} color="primary" size="md" />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to={`/lessons/${nextLesson?.id || displayedLessons[0]?.id}`}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm shadow-md"
                  >
                    <Play size={16} />
                    <span>{completedCount > 0 ? `Continue: ${nextLesson?.title || 'Next Lesson'}` : `Start First Lesson: ${displayedLessons[0]?.title || 'Lesson 1'}`}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleUnenroll}
                    disabled={unenrolling}
                    className="btn-ghost text-xs text-rose-500 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                    title="Drop Course"
                  >
                    <Trash2 size={14} />
                    <span>{unenrolling ? 'Dropping...' : 'Drop Course'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-primary px-7 py-2.5 text-sm shadow-sm"
              >
                {enrolling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Enroll in this Course
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 display-tight">
              <BookOpen size={20} className="text-primary" />
              Course Lessons & Syllabus ({displayedLessons.length})
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isEnrolled
                ? 'Select any unlocked lesson to continue your interactive training.'
                : 'Enroll in this course to unlock all interactive lessons and exercises.'}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl divide-y divide-outline-variant/10 overflow-hidden shadow-sm">
          {displayedLessons.map((lesson, i) => {
            const isCompleted = Boolean(lesson.completed);
            const isLocked = !isEnrolled ? (i > 0) : (!isCompleted && i > 0 && !displayedLessons[i - 1]?.completed);
            const lessonNum = lesson.number || lesson.order_num || i + 1;

            return (
              <Link
                key={lesson.id || i}
                to={isLocked ? '#' : `/lessons/${lesson.id}`}
                onClick={(e) => {
                  if (!isEnrolled && i > 0) {
                    e.preventDefault();
                    toast('Please enroll in the course to unlock all lessons', { icon: '🎓' });
                  } else if (isLocked) {
                    e.preventDefault();
                    toast('Complete previous lessons first', { icon: '🔒' });
                  }
                }}
                className={`flex items-center gap-4 p-4 transition-all duration-200 ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed bg-surface-container/20'
                    : 'hover:bg-surface-container-high/50 cursor-pointer'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isLocked
                    ? 'bg-surface-container-high text-on-surface-variant/40 border border-outline-variant/15'
                    : 'bg-primary text-white shadow-xs shadow-primary/25'
                }`}>
                  {isCompleted ? <CheckCircle size={18} /> : isLocked ? <Lock size={15} /> : lessonNum}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-on-surface font-semibold truncate">{lesson.title}</p>
                    {isCompleted && (
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{lesson.duration || '15 min'}</p>
                </div>
                {!isLocked && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-semibold hidden sm:inline">
                      {isCompleted ? 'Review' : 'Start'}
                    </span>
                    <ChevronRight size={16} className="text-primary flex-shrink-0" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2 display-tight">
          <Brain size={18} className="text-tertiary" />
          Related Quizzes
        </h2>
        {course?.quizzes && course.quizzes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {course.quizzes.map((quiz) => (
              <div key={quiz.id} className="glass-card p-5 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">{quiz.title}</h4>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    {Array.isArray(quiz.questions) ? quiz.questions.length : 10} questions &middot; {quiz.passing_score || 70}% passing score
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 shadow-md shadow-violet-500/25 flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Interactive Knowledge Quizzes</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Challenge yourself and earn certificates across Python, JavaScript, SQL, and more.
              </p>
            </div>
            <button
              onClick={() => navigate('/quizzes')}
              className="btn-primary px-5 py-2 text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <span>Explore Quizzes</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
