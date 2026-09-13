import React from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, GraduationCap, Award } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { PriorityBadge } from '../common/Badge';

export const CalendarView: React.FC = () => {
  const { calendarEvents, tasks, certifications, projects } = useDashboardStore();

  const todayStr = new Date().toISOString().split('T')[0];

  // Aggregate all events
  const allEvents = [
    ...calendarEvents,
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      date: t.dueDate,
      type: 'task' as const,
      priority: t.priority,
      completed: t.status === 'completed'
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: `Project Target: ${p.name}`,
      date: p.targetCompletionDate,
      type: 'project_deadline' as const,
      priority: 'high' as const
    })),
    ...certifications
      .filter((c) => c.examDate)
      .map((c) => ({
        id: `cert-${c.id}`,
        title: `Exam: ${c.name}`,
        date: c.examDate!,
        type: 'cert_exam' as const,
        priority: 'critical' as const
      }))
  ];

  // Sort by date
  const sortedEvents = [...allEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[var(--accent-primary)]" />
            Integrated Schedule & Calendar
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Unified chronological schedule aggregating tasks, college exams, certification dates, and project deadlines.
          </p>
        </div>
      </div>

      {/* Events List Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card title="Upcoming Scheduled Events & Deadlines">
            <div className="space-y-3">
              {sortedEvents.map((evt) => {
                const isToday = evt.date === todayStr;
                const isPast = evt.date < todayStr;

                return (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isToday
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)] font-semibold'
                        : 'bg-[var(--bg-surface-subtle)] border-[var(--border-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] font-mono text-center shrink-0">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                          {new Date(evt.date).toLocaleDateString([], { month: 'short' })}
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          {evt.date.split('-')[2]}
                        </div>
                      </div>

                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {evt.title}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] capitalize flex items-center gap-2 mt-0.5">
                          <span>{evt.type.replace('_', ' ')}</span>
                          {isToday && <span className="text-[var(--accent-primary)] font-bold">• TODAY</span>}
                          {isPast && <span className="text-rose-500 font-semibold">• OVERDUE</span>}
                        </div>
                      </div>
                    </div>

                    <div>{evt.priority && <PriorityBadge priority={evt.priority} />}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Calendar Legend / Summary */}
        <div className="space-y-4">
          <Card title="Event Categories Legend">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Daily & Learning Tasks</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span>College Exams & Midterms</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200">
                <Award className="w-4 h-4 text-purple-500" />
                <span>Certification Exams</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200">
                <AlertTriangle className="w-4 h-4 text-emerald-500" />
                <span>Project Target Deadlines</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
