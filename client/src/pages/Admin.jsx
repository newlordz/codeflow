import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  BookOpen,
  HelpCircle,
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Send,
  Video,
  FileText,
  UserCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

export default function Admin() {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'users' | 'qa'
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & form state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    language: 'Python',
    level: 'Beginner',
    duration: '6 weeks',
    icon: 'terminal',
  });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '# Lesson Title\n\nWrite interactive lesson content here in Markdown.',
    duration: '15 min',
    video_url: '',
  });

  const [userSearch, setUserSearch] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAllData = async () => {
    try {
      const [statsRes, coursesRes, usersRes, qaRes] = await Promise.all([
        get('/admin/stats'),
        get('/admin/courses'),
        get('/admin/users'),
        get('/admin/questions'),
      ]);
      setStats(statsRes);
      setCourses(coursesRes || []);
      setUsersList(usersRes || []);
      setQuestions(qaRes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [get]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Course Handlers
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      language: 'Python',
      level: 'Beginner',
      duration: '6 weeks',
      icon: 'terminal',
    });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      language: course.language,
      level: course.level,
      duration: course.duration || '6 weeks',
      icon: course.icon || 'terminal',
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      toast.error('Please enter course title and description');
      return;
    }
    setSubmittingAction(true);
    try {
      if (editingCourse) {
        await put(`/admin/courses/${editingCourse.id}`, courseForm);
        toast.success('Course updated successfully!');
      } else {
        await post('/admin/courses', courseForm);
        toast.success('New course created successfully!');
      }
      setCourseModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to save course');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This will delete all its lessons.`)) {
      return;
    }
    try {
      await del(`/admin/courses/${courseId}`);
      toast.success(`Course "${courseTitle}" deleted.`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = (course) => {
    setSelectedCourseForLesson(course);
    setLessonForm({
      title: '',
      description: '',
      content: '# Lesson Title\n\nWrite interactive lesson content here in Markdown.',
      duration: '15 min',
      video_url: '',
    });
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.content.trim()) {
      toast.error('Please provide lesson title and content');
      return;
    }
    setSubmittingAction(true);
    try {
      await post(`/admin/courses/${selectedCourseForLesson.id}/lessons`, lessonForm);
      toast.success(`Lesson added to ${selectedCourseForLesson.title}!`);
      setLessonModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to add lesson');
    } finally {
      setSubmittingAction(false);
    }
  };

  // User Role Handlers
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    if (targetUser.id === user.id) {
      toast.error('You cannot change your own admin status');
      return;
    }
    try {
      await put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      toast.success(`User "${targetUser.username}" is now a ${newRole}!`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Delete user "${targetUser.username}" (${targetUser.email})?`)) {
      return;
    }
    try {
      await del(`/admin/users/${targetUser.id}`);
      toast.success(`User "${targetUser.username}" deleted.`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // Q&A Answer Handler
  const handleAnswerQuestion = async (qId) => {
    if (!answerText.trim()) {
      toast.error('Please enter an answer before submitting');
      return;
    }
    setSubmittingAction(true);
    try {
      await post(`/admin/questions/${qId}/answer`, { response: answerText });
      toast.success('Answer published and student notified!');
      setAnsweringQuestionId(null);
      setAnswerText('');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to answer question');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
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
      className="space-y-8 pb-16"
    >
      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-mono font-semibold mb-2">
            <Shield size={13} />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold display-tight text-on-surface">
            Admin Panel
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time management for users, courses, curriculum, and community Q&A.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateCourse}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6 text-sm font-semibold">
        {[
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
          { key: 'users', label: `Users (${usersList.length})`, icon: Users },
          {
            key: 'qa',
            label: `Q&A Desk ${stats?.pendingQuestions > 0 ? `(${stats.pendingQuestions} new)` : ''}`,
            icon: HelpCircle,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-3 transition-colors relative ${
              activeTab === tab.key
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="admin-active-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Users size={19} />
                </div>
                <span className="text-xs font-mono text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full font-semibold">
                  Registered
                </span>
              </div>
              <p className="text-3xl font-bold text-on-surface font-mono">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Platform Learners</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <BookOpen size={19} />
                </div>
                <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-on-surface font-mono">{stats?.totalCourses || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Total Courses</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <Layers size={19} />
                </div>
                <span className="text-xs font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">
                  Curriculum
                </span>
              </div>
              <p className="text-3xl font-bold text-on-surface font-mono">{stats?.totalLessons || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Published Lessons</p>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl" hover>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                  <HelpCircle size={19} />
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${
                  stats?.pendingQuestions > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {stats?.pendingQuestions || 0} Pending
                </span>
              </div>
              <p className="text-3xl font-bold text-on-surface font-mono">{stats?.totalQuestions || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1 font-mono">Student Questions</p>
            </GlassPanel>
          </div>

          {/* Recent User Signups */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Recent Registrations
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-mono text-on-surface-variant uppercase">
                    <th className="pb-3 font-semibold">Username</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Joined At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {(stats?.recentUsers || []).map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="py-3 font-medium text-on-surface">{u.username}</td>
                      <td className="py-3 text-on-surface-variant font-mono text-xs">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                          u.role === 'admin'
                            ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-on-surface-variant font-mono">
                        {new Date(u.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES & LESSONS */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Manage Courses & Syllabi</h3>
            <button
              onClick={handleOpenCreateCourse}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add Course
            </button>
          </div>

          <div className="grid gap-4">
            {courses.map((c) => (
              <GlassPanel key={c.id} className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4" hover>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container border border-outline-variant/30 text-on-surface">
                        {c.language}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container text-on-surface-variant">
                        {c.level}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        &bull; {c.duration}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-on-surface">{c.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{c.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-mono text-on-surface-variant">
                      <span><strong>{c.real_lessons_count || c.lessons_count || 0}</strong> lessons</span>
                      <span><strong>{c.real_enrolled_count || c.enrolled_count || 0}</strong> students enrolled</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => handleOpenAddLesson(c)}
                    className="btn-ghost px-3 py-1.5 text-xs text-primary border border-primary/20 rounded-lg flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Lesson
                  </button>
                  <button
                    onClick={() => handleOpenEditCourse(c)}
                    className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    className="p-2 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-on-surface">Registered Users Directory</h3>
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search username or email..."
                className="input-premium pl-9 pr-4 py-2 text-xs"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-mono text-on-surface-variant uppercase bg-surface-container/20">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Enrollments</th>
                    <th className="p-4 font-semibold">Streak</th>
                    <th className="p-4 font-semibold">XP</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-on-surface">{u.username}</div>
                        <div className="text-xs text-on-surface-variant font-mono">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                          u.role === 'admin'
                            ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">{u.enrolled_courses || 0} courses</td>
                      <td className="p-4 font-mono text-xs text-amber-500 font-semibold">{u.streak || 0}d</td>
                      <td className="p-4 font-mono text-xs">{u.xp || 0} XP</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-colors"
                          >
                            {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                          </button>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Q&A MODERATION */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Student Questions & Inquiries</h3>
            <span className="text-xs font-mono text-on-surface-variant">
              {questions.filter((q) => !q.answered).length} questions awaiting answer
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <HelpCircle size={40} className="text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-on-surface font-semibold">No questions in queue</p>
              <p className="text-xs text-on-surface-variant mt-1">Student submissions from the Q&A page will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <GlassPanel key={q.id} className="p-5 rounded-2xl" hover>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                          q.answered
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {q.answered ? 'Answered' : 'Awaiting Reply'}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">
                          From: <strong>{q.student_name || q.email || 'Student'}</strong> &bull;{' '}
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-on-surface mt-2">{q.subject}</h4>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant bg-surface-container/40 p-3 rounded-xl mb-3 leading-relaxed">
                    {q.message}
                  </p>

                  {q.answered ? (
                    <div className="border-t border-outline-variant/15 pt-3 mt-3">
                      <p className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Official Answer Provided:
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">{q.response}</p>
                    </div>
                  ) : answeringQuestionId === q.id ? (
                    <div className="mt-3 space-y-2.5">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type official instructor answer..."
                        rows={4}
                        className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setAnsweringQuestionId(null);
                            setAnswerText('');
                          }}
                          className="btn-ghost px-3 py-1.5 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAnswerQuestion(q.id)}
                          disabled={submittingAction}
                          className="btn-primary px-4 py-1.5 text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <Send size={13} /> Publish Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringQuestionId(q.id);
                        setAnswerText('');
                      }}
                      className="btn-primary px-4 py-2 text-xs rounded-lg flex items-center gap-1.5 mt-2"
                    >
                      <Send size={13} /> Reply to Student
                    </button>
                  )}
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT COURSE */}
      <AnimatePresence>
        {courseModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setCourseModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-4"
            >
              <div className="glass-panel shadow-premium rounded-2xl p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-on-surface">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h3>
                  <button
                    onClick={() => setCourseModalOpen(false)}
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. Modern Full-Stack Next.js"
                      className="input-premium px-3.5 py-2.5 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                        Language
                      </label>
                      <select
                        value={courseForm.language}
                        onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface"
                      >
                        <option value="Python">Python</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="SQL">SQL</option>
                        <option value="Rust">Rust</option>
                        <option value="Go">Go</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                        Level
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      placeholder="e.g. 8 weeks"
                      className="input-premium px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Description
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="Describe what learners will achieve in this course..."
                      rows={3}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setCourseModalOpen(false)}
                      className="btn-ghost px-4 py-2 text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="btn-primary px-5 py-2 text-xs rounded-xl shadow-sm disabled:opacity-50"
                    >
                      {submittingAction ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: ADD LESSON */}
      <AnimatePresence>
        {lessonModalOpen && selectedCourseForLesson && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setLessonModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl p-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="glass-panel shadow-premium rounded-2xl p-6 md:p-7">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Add Lesson</h3>
                    <p className="text-xs text-on-surface-variant font-mono">
                      To course: {selectedCourseForLesson.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setLessonModalOpen(false)}
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveLesson} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="e.g. Asynchronous JavaScript & Promises"
                      className="input-premium px-3.5 py-2.5 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                        placeholder="e.g. 20 min"
                        className="input-premium px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                        Video URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={lessonForm.video_url}
                        onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                        placeholder="https://..."
                        className="input-premium px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Lesson Description
                    </label>
                    <input
                      type="text"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      placeholder="Brief one-line summary..."
                      className="input-premium px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-mono uppercase">
                      Lesson Content (Markdown)
                    </label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      rows={8}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface font-mono focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setLessonModalOpen(false)}
                      className="btn-ghost px-4 py-2 text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="btn-primary px-5 py-2 text-xs rounded-xl shadow-sm disabled:opacity-50"
                    >
                      {submittingAction ? 'Adding...' : 'Add Lesson'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
