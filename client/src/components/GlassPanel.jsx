import { motion } from 'framer-motion';

export default function GlassPanel({ children, className = '', hover = false, onClick }) {
  const base = hover ? 'glass-card cursor-pointer' : 'glass-panel';
  return (
    <motion.div
      className={`${base} rounded-xl ${className}`}
      onClick={onClick}
      whileTap={hover ? { scale: 0.985 } : undefined}
    >
      {children}
    </motion.div>
  );
}
