import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, color = 'primary', size = 'md', showLabel = false }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'from-primary to-primary-container',
    secondary: 'from-secondary to-secondary-container',
    tertiary: 'from-tertiary to-tertiary-container',
  };

  const textColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
  };

  return (
    <div className="w-full">
      <div className={`w-full ${heightClasses[size]} bg-surface-container-high rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color] || colorClasses.primary}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-mono mt-0.5 block ${textColors[color] || textColors.primary}`}>
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
