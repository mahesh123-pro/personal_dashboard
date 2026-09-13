import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 - 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'amber' | 'purple';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorStyles = {
    blue: 'bg-[var(--accent-primary)]',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-[var(--text-muted)]">
          <span>Progress</span>
          <span className="font-semibold text-[var(--text-primary)]">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[var(--bg-surface-hover)] rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${heightStyles[size]} ${colorStyles[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
