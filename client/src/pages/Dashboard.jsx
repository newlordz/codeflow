import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Award,
  Brain,
  Clock,
  TrendingUp,
  Play,
  Quote,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Flame,
  Terminal,
  Globe,
  Bot,
  Layers,
  GitBranch,
  Database,
  Code2,
  Target,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';

const greetings = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
};

const quotes = [
  { text: 'The only way to learn programming is by doing it.', author: 'Brian Kernighan' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'Programming isn\'t about what you know; it\'s about what you can figure out.', author: 'Chris Pine' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return greetings.morning;
  if (hour < 17) return greetings.afternoon;
  return greetings.evening;
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center flex-shrink-0 text-white`}>
      <IconComp size={20} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { get, post } = useApi();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        get('/dashboard'),
        get('/courses'),
      ]);
      setDashboardData(dashRes);
      setAllCourses(Array.isArray(coursesRes) ? coursesRes : coursesRes?.courses || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [get]);

  const handleEnrollFromDashboard = async (courseId, courseTitle) => {
    setEnrollingId(courseId);
    try {
      await post(`/courses/${courseId}/enroll`);
      toast.success(`Enrolled in ${courseTitle}! Let's start learning!`, { icon: '🎉' });
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const enrolledCourses = dashboardData?.enrolledCourses || [];
  const coursesInProgress = enrolledCourses.length;
  const lessonsCompleted = dashboardData?.lessonsCompleted || 0;
  const totalEnrolledLessons = dashboardData?.totalEnrolledLessons ?? enrolledCourses.reduce((sum, c) => sum + (c.lessons_count || 0), 0);
  const overallProgress = dashboardData?.overallProgress ?? (totalEnrolledLessons > 0 ? Math.round((lessonsCompleted / totalEnrolledLessons) * 100) : 0);
  const nextLesson = dashboardData?.nextLesson || null;
  const certificatesEarned = dashboardData?.certificatesEarned || 0;
  const quizAverage = dashboardData?.quizAverage || 0;
  const currentStreak = user?.streak ?? dashboardData?.currentStreak ?? 0;
  const xp = user?.xp ?? dashboardData?.xp ?? 0;

  const statCards = [
    {
      label: 'Courses Enrolled',
      value: coursesInProgress,
      icon: BookOpen,
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      bgGlow: 'bg-blue-500/10',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Lessons Mastered',
      value: lessonsCompleted,
      icon: CheckCircle,
      gradient: 'from-emerald-600 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      bgGlow: 'bg-emerald-500/10',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Certificates',
      value: certificatesEarned,
      icon: Award,
      gradient: 'from-violet-600 to-purple-500',
      shadow: 'shadow-purple-500/20',
      bgGlow: 'bg-purple-500/10',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Total XP Earned',
      value: xp,
      icon: Flame,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      bgGlow: 'bg-amber-500/10',
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  // Pick courses not yet enrolled for recommended / selection
  const unenrolledCourses = allCourses.filter(
    (c) => !enrolledCourses.some((ec) => ec.id === c.id)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 shimmer h-32" />
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
      className="space-y-7 pb-12 w-full min-w-0"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-1">
            {formattedDate}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold display-tight text-on-surface truncate">
            {getGreeting()}, <span className="text-primary">{user?.username || 'Developer'}</span>
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1">
            {enrolledCourses.length > 0
              ? 'Ready to continue where you left off?'
              : 'Welcome to CodeFlow! Select your first course to begin learning.'}
          </p>
        </div>
        <StreakBadge streak={currentStreak} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassPanel className="p-4 sm:p-5 relative overflow-hidden rounded-2xl" hover>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md ${stat.shadow}`}>
                  <stat.icon size={18} />
                </div>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${stat.bgGlow} ${stat.color}`}>
                  Live
                </span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface font-mono">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-on-surface-variant mt-1 font-mono truncate">{stat.label}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Learning Progress Hub */}
      {enrolledCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassPanel className="p-5 sm:p-6 rounded-2xl relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-surface to-surface shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Column: Overall Progress & Milestones */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <TrendingUp size={19} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-on-surface">Learning Progress & Milestones</h2>
                      <p className="text-xs text-on-surface-variant font-mono">
                        {lessonsCompleted} of {totalEnrolledLessons} lessons mastered across your enrolled stack
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25">
                    {overallProgress}% Overall Mastery
                  </span>
                </div>

                {/* Animated Overall Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xs"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(overallProgress, enrolledCourses.length > 0 ? 3 : 0)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                    <span className={overallProgress >= 0 ? 'text-primary font-semibold' : ''}>Starter (0%)</span>
                    <span className={`hidden sm:inline ${overallProgress >= 25 ? 'text-primary font-semibold' : ''}`}>Fundamentals (25%)</span>
                    <span className={overallProgress >= 50 ? 'text-primary font-semibold' : ''}>Core (50%)</span>
                    <span className={`hidden sm:inline ${overallProgress >= 75 ? 'text-primary font-semibold' : ''}`}>Advanced (75%)</span>
                    <span className={overallProgress >= 100 ? 'text-emerald-500 font-semibold' : ''}>Certified (100%)</span>
                  </div>
                </div>

                {/* Milestones stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { label: 'Active Courses', value: `${enrolledCourses.length}`, icon: BookOpen, color: 'text-blue-500' },
                    { label: 'Lessons Mastered', value: `${lessonsCompleted}/${totalEnrolledLessons}`, icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Quiz Score Avg', value: `${quizAverage}%`, icon: Brain, color: 'text-violet-500' },
                    { label: 'Certificates', value: `${certificatesEarned}`, icon: Award, color: 'text-amber-500' },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/25 flex items-center gap-2.5">
                      <m.icon size={16} className={m.color} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface font-mono leading-tight">{m.value}</p>
                        <p className="text-[10px] text-on-surface-variant truncate leading-tight">{m.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Next Up to Learn */}
              <div className="lg:w-80 flex-shrink-0 p-4 rounded-xl bg-surface-container/70 border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Target size={13} /> Next Up to Learn
                    </span>
                    {nextLesson && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        +{nextLesson.xp_reward || 50} XP
                      </span>
                    )}
                  </div>
                  {nextLesson ? (
                    <div>
                      <p className="text-[11px] text-on-surface-variant font-mono truncate">{nextLesson.course_title}</p>
                      <h3 className="text-sm font-bold text-on-surface line-clamp-2 mt-0.5 mb-1.5">
                        {nextLesson.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-2 font-mono">
                        <Clock size={12} /> {nextLesson.duration || '10 min'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-bold text-on-surface mb-1">
                        {totalCompletedLessons > 0 ? 'All Enrolled Lessons Completed!' : 'Start Learning'}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {totalCompletedLessons > 0 ? 'Great job! Take quizzes to claim your certificates.' : 'Choose any course below to begin your coding journey.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20">
                  {nextLesson ? (
                    <Link
                      to={`/lessons/${nextLesson.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Play size={13} className="fill-white" /> Resume Lesson
                    </Link>
                  ) : enrolledCourses[0] ? (
                    <Link
                      to={`/courses/${enrolledCourses[0].id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      View Course <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <Link
                      to="/courses"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      Browse Catalog <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Main Content Area: Enrolled Courses OR Selection Flow */}
      {enrolledCourses.length === 0 ? (
        /* Empty State: Course Selection Onboarding */
        <div className="glass-panel p-6 md:p-8 rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-surface">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 chip mb-2">
                <Sparkles size={13} className="text-primary" />
                <span>Get Started in 1-Click</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface display-tight">
                Select Your First Course
              </h2>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
                You are not enrolled in any courses yet. Choose any curriculum below to start your hands-on coding journey.
              </p>
            </div>
            <Link
              to="/courses"
              className="btn-primary px-5 py-2.5 text-xs self-start md:self-auto flex items-center gap-1.5"
            >
              Browse Full Catalog <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCourses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="glass-card p-5 rounded-xl flex flex-col justify-between border border-outline-variant/30 hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <CourseIconTile icon={course.icon} title={course.title} />
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
                      {course.language}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface mb-1">{course.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <button
                  onClick={() => handleEnrollFromDashboard(course.id, course.title)}
                  disabled={enrollingId === course.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-xs transition-all disabled:opacity-50"
                >
                  {enrollingId === course.id ? (
                    'Enrolling...'
                  ) : (
                    <>
                      <PlusCircle size={14} /> Enroll in this Course
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Enrolled Courses */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2">
              <Play size={17} className="text-primary" />
              Your Active Courses ({enrolledCourses.length})
            </h2>
            <Link
              to="/courses"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              Explore more courses <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassPanel className="p-5 h-full flex flex-col hover:border-primary/40 transition-all rounded-2xl" hover>
                  <div className="flex items-start justify-between mb-3">
                    <CourseIconTile icon={course.icon} title={course.title} />
                    <div className="flex gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
                        {course.language}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface mb-2">{course.title}</h3>

                  <div className="mt-auto space-y-2.5 pt-3 border-t border-outline-variant/15">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">
                        {course.completed_lessons !== undefined ? `${course.completed_lessons} of ${course.lessons_count || 0} lessons` : 'Progress'}
                      </span>
                      <span className="text-primary font-bold">{course.progress || 0}%</span>
                    </div>
                    <ProgressBar value={course.progress || 0} color="primary" size="sm" />
                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-xs transition-colors"
                    >
                      Continue Course <ArrowRight size={13} />
                    </Link>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses to Explore (if any unenrolled remain) */}
      {unenrolledCourses.length > 0 && enrolledCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <Sparkles size={18} className="text-tertiary" />
              More Courses to Add to Your Stack
            </h2>
            <Link to="/courses" className="text-xs text-primary hover:underline">
              See all
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unenrolledCourses.slice(0, 3).map((course) => (
              <GlassPanel key={course.id} className="p-4 rounded-xl flex items-center justify-between gap-3" hover>
                <div className="flex items-center gap-3 min-w-0">
                  <CourseIconTile icon={course.icon} title={course.title} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-on-surface truncate">{course.title}</h4>
                    <p className="text-[11px] text-on-surface-variant font-mono">{course.language} &bull; {course.level}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleEnrollFromDashboard(course.id, course.title)}
                  disabled={enrollingId === course.id}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors flex-shrink-0"
                >
                  + Enroll
                </button>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Inspirational Quote */}
      <GlassPanel className="p-6 relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />
        <div className="flex items-start gap-4">
          <div className="text-tertiary mt-1">
            <Quote size={24} />
          </div>
          <div>
            <blockquote className="text-base text-on-surface font-medium italic mb-1.5">
              &ldquo;{quotes[quoteIndex].text}&rdquo;
            </blockquote>
            <cite className="text-xs text-on-surface-variant not-italic font-mono">
              &mdash; {quotes[quoteIndex].author}
            </cite>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
