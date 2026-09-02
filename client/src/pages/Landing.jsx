import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, BookOpen, Brain, Award, Zap, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Courses',
    description: 'Master Python, JavaScript, SQL, and more with hands-on lessons and real-world projects.',
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/25',
  },
  {
    icon: Code2,
    title: 'Live Code Playground',
    description: 'Write and test code directly in your browser with our integrated coding environment.',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
  },
  {
    icon: Brain,
    title: 'Challenge Quizzes',
    description: 'Test your knowledge with adaptive quizzes and earn certificates for your achievements.',
    gradient: 'from-purple-500 to-indigo-600',
    shadow: 'shadow-purple-500/25',
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Get recognized for your skills with shareable certificates upon course completion.',
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <div className="min-h-screen app-bg text-on-surface transition-colors duration-300 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)' }}
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10), transparent 70%)' }}
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel border-b border-outline-variant/30 shadow-xs">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <span className="text-white font-bold text-xs font-mono">{'</>'}</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Code</span>
              <span className="text-on-surface">Flow</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary px-5 py-2 text-sm shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-36 pb-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 chip px-4 py-1.5 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={14} className="text-primary" />
            <span>Join 500,000+ developers learning today</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold display-tight leading-[1.05] mb-6">
            Master the art of
            <br />
            <span className="gradient-text-primary">programming.</span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            An immersive learning platform that takes you from your first line of code
            to production-ready applications. Interactive lessons, live coding, and
            certificates that matter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base group">
              <span>Start Learning Free</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-base text-on-surface"
            >
              I already have an account
            </Link>
          </div>

          <motion.div
            className="mt-14 flex items-center justify-center gap-8 text-on-surface-variant/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { value: '500K+', label: 'Learners' },
              { value: '6', label: 'Courses' },
              { value: '200+', label: 'Lessons' },
              { value: '98%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-on-surface font-mono display-tight">{s.value}</p>
                <p className="text-xs font-mono mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-20 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold display-tight mb-3">
              Everything you need to <span className="gradient-text-primary">succeed</span>
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">
              A complete toolkit designed to keep you motivated and moving forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants} className="glass-card rounded-xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md ${feature.shadow} flex items-center justify-center mb-5`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-on-surface mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative glass-panel rounded-2xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(77,142,255,0.18), transparent 70%)' }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold display-tight mb-4">
                Ready to start your <span className="gradient-text-primary">coding journey?</span>
              </h2>
              <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
                Join thousands of learners mastering programming with CodeFlow.
                Free to start, no credit card required.
              </p>
              <Link to="/signup" className="btn-primary inline-flex px-8 py-3.5 text-base">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-10 px-6 border-t border-outline-variant/15">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-premium flex items-center justify-center">
              <span className="text-white font-bold text-[9px] font-mono">{'</>'}</span>
            </div>
            <span className="text-sm text-on-surface-variant">
              CodeFlow &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-on-surface-variant">
            <span className="hover:text-on-surface cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
