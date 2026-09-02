import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setSubmitting(true);
    try {
      await login('admin@codeflow.com', 'password123');
      toast.success('Signed in as Administrator!', { icon: '🛡️' });
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Admin login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setSubmitting(true);
    try {
      await login('demo@codeflow.com', 'password123');
      toast.success('Signed in as Demo Student!', { icon: '🚀' });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)' }}
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10), transparent 70%)' }}
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="w-full max-w-5xl relative z-10 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          className="hidden lg:block pr-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 chip mb-6">
            <Sparkles size={14} className="text-primary" />
            <span>Smart Developer Platform</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold display-tight leading-[1.1] mb-5 text-on-surface">
            Welcome back to
            <br />
            <span className="gradient-text-primary">CodeFlow.</span>
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed mb-8 max-w-md">
            Continue learning Python, JavaScript, and SQL with real-time feedback and milestone certificates.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-secondary" />
                <span className="text-xs font-mono font-semibold text-on-surface">Admin Ready</span>
              </div>
              <p className="text-xs text-on-surface-variant">Full curriculum control & student moderation</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-tertiary" />
                <span className="text-xs font-mono font-semibold text-on-surface">Live Code Editor</span>
              </div>
              <p className="text-xs text-on-surface-variant">Browser execution with instant test cases</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-md mx-auto lg:mx-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="glass-panel shadow-premium rounded-2xl p-8 md:p-9">
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                  <span className="text-white font-bold text-sm font-mono">{'</>'}</span>
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-primary">Code</span>
                  <span className="text-on-surface">Flow</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface display-tight">Welcome back</h2>
              <p className="text-sm text-on-surface-variant mt-1.5">
                Sign in to continue your learning journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-mono">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-premium pl-10 pr-4 py-3"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-premium pl-10 pr-12 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Fast 1-Click Login Section */}
            <div className="mt-5 space-y-2.5">
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-outline-variant/30 w-full" />
                <span className="bg-surface px-3 text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold absolute">
                  1-Click Fast Login
                </span>
              </div>

              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-violet-500/10 hover:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25 transition-all shadow-xs group"
              >
                <ShieldCheck size={16} className="text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                <span>Log in as Administrator (Instant)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-all shadow-xs"
              >
                <Zap size={14} className="text-amber-500" />
                <span>Log in as Demo Student</span>
              </button>
            </div>

            <div className="divider-premium my-6" />

            <div className="text-center space-y-2">
              <p className="text-sm text-on-surface-variant">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
