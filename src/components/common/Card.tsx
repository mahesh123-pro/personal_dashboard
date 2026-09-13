import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = 'md',
  hoverEffect = false,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  return (
    <div
      className={`glass-panel rounded-xl ${hoverEffect ? 'glass-panel-hover transition-all' : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border-main)]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
    </div>
  );
};
