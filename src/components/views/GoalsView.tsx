import React from 'react';
import { Target, Plus, Calendar, Flag } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PriorityBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

export const GoalsView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { goals } = useDashboardStore();

  const shortTermGoals = goals.filter((g) => g.timeframe === 'short_term');
  const longTermGoals = goals.filter((g) => g.timeframe === 'long_term');

  const renderGoalCard = (goal: typeof goals[0]) => {
    const completedMilestones = goal.milestones.filter((m) => m.completed).length;

    return (
      <Card key={goal.id} hoverEffect className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">
              {goal.name}
            </h3>
            <PriorityBadge priority={goal.priority} />
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{goal.description}</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Goal Progress</span>
            <span className="font-bold text-[var(--text-primary)]">{goal.progress}%</span>
          </div>
          <ProgressBar progress={goal.progress} size="sm" color="green" />
        </div>

        {/* Milestones */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] space-y-2">
          <div className="text-xs font-bold text-[var(--text-primary)] flex justify-between">
            <span>Key Milestones</span>
            <span className="text-[var(--text-muted)]">{completedMilestones}/{goal.milestones.length}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {goal.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  const updatedMs = goal.milestones.map((item) =>
                    item.id === m.id ? { ...item, completed: !item.completed } : item
                  );
                  const compCount = updatedMs.filter((x) => x.completed).length;
                  const newProg = Math.round((compCount / updatedMs.length) * 100);
                  store.updateGoal(goal.id, {
                    milestones: updatedMs,
                    progress: newProg
                  });
                }}
                className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-emerald-600"
                />
                <span className={m.completed ? 'line-through text-[var(--text-muted)]' : ''}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-main)]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Target: {goal.deadline}
          </span>
          <span className="capitalize px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] font-medium">
            {goal.category}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--accent-primary)]" />
            Goals & Roadmap
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Connect high-level long-term vision with short-term actionable milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onOpenQuickAction('task')}
        >
          Add Goal
        </Button>
      </div>

      {/* Short term goals */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
          <Flag className="w-4 h-4 text-emerald-500" /> Short-Term Focus Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortTermGoals.map(renderGoalCard)}
        </div>
      </div>

      {/* Long term goals */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" /> Long-Term Career & Tech Vision
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {longTermGoals.map(renderGoalCard)}
        </div>
      </div>
    </div>
  );
};
