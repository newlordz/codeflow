import { Flame } from 'lucide-react';

export default function StreakBadge({ count, streak, size = 'md' }) {
  const displayCount = streak !== undefined ? streak : (count !== undefined ? count : 0);
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 12,
    md: 18,
    lg: 26,
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
  };

  const paddingMultiplier = {
    sm: 0.78,
    md: 0.78,
    lg: 0.78,
  };

  return (
    <div className="relative inline-flex items-center justify-center group">
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center animate-pulse`}
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          padding: '2px',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center bg-surface transition-colors duration-300"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <Flame
              size={iconSizes[size]}
              className="text-amber-500"
              style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.45))' }}
              strokeWidth={2.5}
            />
            <span
              className={`${textSizes[size]} font-bold text-on-surface mt-0.5 font-mono leading-none`}
            >
              {displayCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
