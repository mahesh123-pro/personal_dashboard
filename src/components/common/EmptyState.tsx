import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center glass-panel rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] ${className}`}
    >
      <div className="p-4 mb-3 rounded-2xl bg-[var(--bg-surface-hover)] text-[var(--accent-primary)]">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
