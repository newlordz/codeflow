import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  ChevronRight,
  Terminal,
  Globe,
  Bot,
  Layers,
  GitBranch,
  Database,
  Code2,
  CheckCircle2,
  Sparkles,
  Play,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import ProgressBar from '../components/ProgressBar';

const languages = ['All', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'C++', 'Go'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const enrollmentFilters = ['All', 'My Enrolled Courses', 'Available to Enroll'];

function CourseIcon({ icon, title, language }) {
  const t = (title || '').toLowerCase();
  const i = (icon || '').toLowerCase();
  const lang = (language || '').toLowerCase();

  let IconComp = Terminal;
  let gradient = 'from-blue-600 to-indigo-600 shadow-blue-500/25';

  if (i === 'terminal' || lang.includes('python') || t.includes('python')) {
    IconComp = Terminal;
    gradient = 'from-blue-600 to-indigo-600 shadow-blue-500/25';
  } else if (lang.includes('typescript') || t.includes('typescript')) {
    IconComp = Code2;
    gradient = 'from-sky-500 to-blue-700 shadow-blue-500/25';
  } else if (lang.includes('c++') || t.includes('c++') || t.includes('systems')) {
    IconComp = Code2;
    gradient = 'from-indigo-600 to-violet-800 shadow-indigo-500/25';
  } else if (lang.includes('go') || t.includes('go ') || t.includes('golang')) {
    IconComp = Zap;
    gradient = 'from-cyan-500 to-teal-600 shadow-cyan-500/25';
  } else if (i === 'language' || lang.includes('javascript') || t.includes('web') || t.includes('bootcamp')) {
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
  } else if (i === 'storage' || lang.includes('sql') || t.includes('database')) {
    IconComp = Database;
    gradient = 'from-rose-500 to-pink-600 shadow-rose-500/25';
  } else {
    IconComp = Code2;
    gradient = 'from-indigo-600 to-violet-600 shadow-indigo-500/25';
  }

  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center flex-shrink-0 text-white`}>
      <IconComp size={24} />
    </div>
  );
}

const levelColorMap = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  Intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  Advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
};

export default function Courses() {
  const { get, post } = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLang, setActiveLang] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');
  const [enrollFilter, setEnrollFilter] = useState('All');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await get('/courses');
        const list = Array.isArray(data) ? data : data?.courses || [];
        setCourses(list);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [get]);

  const handleEnroll = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    setEnrollingId(course.id);
    try {
      await post(`/courses/${course.id}/enroll`);
      toast.success(`Enrolled in ${course.title}! Start learning now!`, { icon: '🎉' });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id
            ? {
                ...c,
                enrolled: true,
                progress: 0,
                enrolled_count: (c.enrolled_count || 0) + 1,
              }
            : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to drop "${course.title}"?`)) {
      return;
    }
    try {
      await post(`/courses/${course.id}/unenroll`);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, enrolled: false, progress: 0 } : c))
      );
      toast.success(`Dropped "${course.title}". You can re-enroll anytime.`, { icon: '🗑️' });
    } catch (err) {
      toast.error(err.message || 'Failed to drop course');
    }
  };

  const filtered = courses.filter((c) => {
    const isEnrolled = Boolean(c.enrolled);
    const matchSearch =
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchLang = activeLang === 'All' || c.language === activeLang;
    const matchLevel = activeLevel === 'All' || c.level === activeLevel;
    const matchEnroll =
      enrollFilter === 'All' ||
      (enrollFilter === 'My Enrolled Courses' && isEnrolled) ||
      (enrollFilter === 'Available to Enroll' && !isEnrolled);

    return matchSearch && matchLang && matchLevel && matchEnroll;
  });

  const enrolledCount = courses.filter((c) => Boolean(c.enrolled)).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 shimmer h-64" />
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 chip mb-3">
            <Sparkles size={13} className="text-primary" />
            <span>Interactive Curriculum &bull; Real Projects</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface mb-2">
            Explore Courses
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base max-w-xl">
            Choose from comprehensive, hands-on programming courses. Select any course to enroll and start building skills.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="input-premium pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/30 backdrop-blur-sm">
        {/* Enrollment Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant font-mono uppercase tracking-wider mr-1">
            Status:
          </span>
          {enrollmentFilters.map((ef) => (
            <button
              key={ef}
              onClick={() => setEnrollFilter(ef)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                enrollFilter === ef
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
              }`}
            >
              {ef} {ef === 'My Enrolled Courses' && `(${enrolledCount})`}
            </button>
          ))}
        </div>

        {/* Languages and Levels */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-outline-variant/20 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-on-surface-variant font-mono uppercase tracking-wider font-semibold">
              Language:
            </span>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeLang === lang
                    ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-on-surface-variant font-mono uppercase tracking-wider font-semibold">
              Level:
            </span>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeLevel === level
                    ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <BookOpen size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-on-surface font-semibold text-lg">No courses found</h3>
          <p className="text-on-surface-variant text-sm mt-1">
            {enrollFilter === 'My Enrolled Courses'
              ? 'You have not enrolled in any courses yet. Switch to "Available to Enroll" to choose your first course!'
              : 'Try adjusting your search or filters.'}
          </p>
          {enrollFilter === 'My Enrolled Courses' && (
            <button
              onClick={() => setEnrollFilter('Available to Enroll')}
              className="btn-primary mt-4 px-5 py-2 text-xs"
            >
              Browse Available Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course, i) => {
            const isEnrolled = Boolean(course.enrolled);
            const progress = course.progress || 0;
            const lessonCount = course.lessons_count || 24;
            const cleanDuration = course.duration
              ? course.duration.replace(/.*·\s*/, '')
              : '6 weeks';
            const studentCount = (course.enrolled_count || 320).toLocaleString();

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassPanel
                  className="p-6 h-full flex flex-col hover:border-primary/40 transition-all duration-300 relative group rounded-2xl shadow-sm hover:shadow-md"
                  hover
                >
                  {/* Top row: Icon + Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <CourseIcon icon={course.icon} title={course.title} language={course.language} />

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-surface-container border border-outline-variant/40 text-on-surface">
                          {course.language}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono ${levelColorMap[course.level] || ''}`}>
                          {course.level}
                        </span>
                      </div>

                      {isEnrolled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                          <CheckCircle2 size={11} /> Enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Title & Description */}
                  <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono mb-5 pt-3 border-t border-outline-variant/15">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-primary/80" /> {lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-primary/80" /> {cleanDuration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-primary/80" /> {studentCount} students
                    </span>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto pt-2">
                    {isEnrolled ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="text-primary font-bold">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} color="primary" size="sm" />
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/courses/${course.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-xl shadow-xs transition-colors"
                          >
                            Continue Learning <ArrowRight size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleUnenroll(e, course)}
                            className="p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Drop Course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleEnroll(e, course)}
                          disabled={enrollingId === course.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-xl shadow-xs transition-all disabled:opacity-50"
                        >
                          {enrollingId === course.id ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              <span>Enroll Now</span>
                            </>
                          )}
                        </button>
                        <Link
                          to={`/courses/${course.id}`}
                          className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors"
                          title="View course syllabus"
                        >
                          Details
                        </Link>
                      </div>
                    )}
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
