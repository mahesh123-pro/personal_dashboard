import React, { useState } from 'react';
import { BookOpen, Save } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const JournalView: React.FC = () => {
  const { journalEntries } = useDashboardStore();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayEntry = journalEntries.find((e) => e.date === todayStr) || {
    id: '',
    date: todayStr,
    whatILearned: '',
    whatICompleted: '',
    challenges: '',
    improvements: '',
    tomorrowPriority: ''
  };

  const [learned, setLearned] = useState(todayEntry.whatILearned);
  const [completed, setCompleted] = useState(todayEntry.whatICompleted);
  const [challenges, setChallenges] = useState(todayEntry.challenges);
  const [improvements, setImprovements] = useState(todayEntry.improvements);
  const [priority, setPriority] = useState(todayEntry.tomorrowPriority);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveJournalEntry({
      date: todayStr,
      whatILearned: learned,
      whatICompleted: completed,
      challenges,
      improvements,
      tomorrowPriority: priority
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent-primary)]" />
            Daily Journal & Reflection
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Private daily logger to track what you learned, challenges faced, and tomorrow's focus.
          </p>
        </div>

        {savedToast && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
            ✓ Journal saved successfully!
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <Card title={`Daily Reflection • ${todayStr}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                What did I learn today?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. AWS S3 policy evaluation logic and explicit DENY rules..."
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                What did I complete?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Wrote testbench for Synchronous FIFO memory core..."
                value={completed}
                onChange={(e) => setCompleted(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  What went wrong / challenges?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Timing assertions failed on read pointer..."
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  What should I improve tomorrow?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Use non-blocking assignments strictly in sequential logic..."
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Tomorrow's Single Priority Goal
              </label>
              <input
                type="text"
                placeholder="e.g. Complete CMOS inverter lab report and submit by 12:00..."
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] font-semibold"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border-main)]">
              <Button variant="primary" size="md" icon={<Save className="w-4 h-4" />} type="submit">
                Save Reflection
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};
