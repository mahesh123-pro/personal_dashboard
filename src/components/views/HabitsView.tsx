import React from 'react';
import { Zap, Check, Flame } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';

export const HabitsView: React.FC = () => {
  const { habits } = useDashboardStore();

  // Generate last 7 days keys (YYYY-MM-DD)
  const last7Days: { dateStr: string; dayName: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    last7Days.push({
      dateStr,
      dayName,
      isToday: i === 0
    });
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
            Habit & Discipline Tracker
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Build consistent study, coding, and physical routines with daily streak tracking.
          </p>
        </div>
      </div>

      {/* Habits Table / List */}
      <Card title="Weekly Habit Completion Grid">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-main)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Habit Routine</th>
                <th className="py-3 px-2 text-center">Streak</th>
                <th className="py-3 px-2 text-center">Best</th>
                {last7Days.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`py-3 px-2 text-center ${
                      d.isToday ? 'text-[var(--accent-primary)] font-bold' : ''
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal">
                      {d.dateStr.slice(8)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {habits.map((habit) => (
                <tr key={habit.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{habit.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{habit.category} • Target {habit.targetPerWeek}x / week</div>
                  </td>

                  <td className="py-3.5 px-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      <Flame className="w-3.5 h-3.5" /> {habit.currentStreak}d
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-center text-xs font-semibold text-[var(--text-muted)]">
                    {habit.bestStreak}d
                  </td>

                  {last7Days.map((d) => {
                    const isChecked = !!habit.logs[d.dateStr];
                    return (
                      <td key={d.dateStr} className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => store.toggleHabitLog(habit.id, d.dateStr)}
                          className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-500 text-white shadow-xs scale-105'
                              : 'bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-transparent hover:border-[var(--accent-primary)] hover:text-slate-400'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
