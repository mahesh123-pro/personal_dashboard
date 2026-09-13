import React from 'react';
import type { Priority, TaskStatus, ProjectHealth, SkillLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  const variantStyles = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    red: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
  };

  const dotColors = {
    neutral: 'bg-slate-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'critical':
      return <Badge variant="red" dot>Critical</Badge>;
    case 'high':
      return <Badge variant="amber" dot>High</Badge>;
    case 'medium':
      return <Badge variant="blue">Medium</Badge>;
    case 'low':
    default:
      return <Badge variant="neutral">Low</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="green">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="blue" dot>In Progress</Badge>;
    case 'blocked':
      return <Badge variant="red">Blocked</Badge>;
    case 'not_started':
    default:
      return <Badge variant="neutral">Not Started</Badge>;
  }
};

export const HealthBadge: React.FC<{ health: ProjectHealth }> = ({ health }) => {
  switch (health) {
    case 'healthy':
      return <Badge variant="green" dot>Healthy</Badge>;
    case 'at_risk':
      return <Badge variant="amber" dot>At Risk</Badge>;
    case 'stalled':
      return <Badge variant="red" dot>Stalled</Badge>;
  }
};

export const LevelBadge: React.FC<{ level: SkillLevel }> = ({ level }) => {
  const map: Record<SkillLevel, { label: string; variant: 'neutral' | 'blue' | 'purple' | 'amber' | 'green' }> = {
    beginner: { label: 'Beginner', variant: 'neutral' },
    basic: { label: 'Basic', variant: 'blue' },
    intermediate: { label: 'Intermediate', variant: 'purple' },
    advanced: { label: 'Advanced', variant: 'amber' },
    job_ready: { label: 'Job Ready 🚀', variant: 'green' }
  };
  return <Badge variant={map[level].variant}>{map[level].label}</Badge>;
};
