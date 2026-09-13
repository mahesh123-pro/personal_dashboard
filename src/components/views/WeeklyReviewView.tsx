import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  BookOpen,
  Flame,
  Plus,
  Trash2,
  Calendar,
  Award,
  AlertTriangle,
  Target,
  ChevronRight,
  Check
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { WeeklyReview } from '../../types';

export const WeeklyReviewView: React.FC = () => {
  const { tasks, projects, skills, habits, weeklyReviews } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Manual / Editing Weekly Review
  const todayStr = new Date().toISOString().split('T')[0];
  const [weekEndingDate, setWeekEndingDate] = useState(todayStr);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatDidntGoWell, setWhatDidntGoWell] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [customTasksCount, setCustomTasksCount] = useState<number>(0);
  const [customProjectsCount, setCustomProjectsCount] = useState<number>(0);
  const [customSkillsCount, setCustomSkillsCount] = useState<number>(0);
  const [customHabitRate, setCustomHabitRate] = useState<number>(0);

  // ----------------------------------------------------
  // AUTOMATIC WEEKLY REVIEW CALCULATION ENGINE
  // ----------------------------------------------------
  const calculatePast7DaysMetrics = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // 1. Tasks completed in last 7 days (or currently completed)
    const completedTasksLast7Days = tasks.filter(
      (t) => t.status === 'completed' && (t.completedAt ? t.completedAt.split('T')[0] >= sevenDaysAgoStr : true)
    );

    // 2. Active projects with recent progress
    const activeProjects = projects.filter((p) => p.status === 'active' || p.progress > 0);

    // 3. Skills practiced
    const skillsPracticed = skills.filter(
      (s) => s.lastStudiedDate && s.lastStudiedDate >= sevenDaysAgoStr
    );
    const totalSkillsCount = skillsPracticed.length > 0 ? skillsPracticed.length : skills.length;

    // 4. Habit completion rate across past 7 days
    let totalHabitSlots = 0;
    let completedHabitSlots = 0;
    habits.forEach((h) => {
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        totalHabitSlots++;
        if (h.logs[dStr]) completedHabitSlots++;
      }
    });

    const habitRate = totalHabitSlots > 0 ? Math.round((completedHabitSlots / totalHabitSlots) * 100) : 85;

    return {
      completedTasksCount: completedTasksLast7Days.length,
      activeProjectsCount: activeProjects.length,
      skillsPracticedCount: totalSkillsCount,
      habitsCompletedRate: habitRate,
      completedTasks: completedTasksLast7Days,
      activeProjects: activeProjects
    };
  };

  const currentMetrics = calculatePast7DaysMetrics();

  // Compute Weekly Overall Productivity Score (0-100)
  const taskWeight = Math.min(currentMetrics.completedTasksCount * 12, 40);
  const habitWeight = Math.round(currentMetrics.habitsCompletedRate * 0.4);
  const projectWeight = Math.min(currentMetrics.activeProjectsCount * 7, 20);
  const overallProductivityScore = Math.min(100, Math.max(50, taskWeight + habitWeight + projectWeight));

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', label: 'Exceptional Sprint', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 80) return { grade: 'A', label: 'High Velocity', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    if (score >= 70) return { grade: 'B+', label: 'Steady Progress', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { grade: 'B', label: 'Needs Consistency', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const scoreInfo = getScoreGrade(overallProductivityScore);

  // ----------------------------------------------------
  // AUTOMATIC REVIEW GENERATOR ACTION
  // ----------------------------------------------------
  const handleAutoGenerateReview = () => {
    const metrics = calculatePast7DaysMetrics();

    // Auto-synthesize "What Went Well"
    const topCompletedTaskTitles = metrics.completedTasks.slice(0, 3).map((t) => t.title).join(', ');
    const topProjects = metrics.activeProjects.slice(0, 2).map((p) => `${p.name} (${p.progress}% done)`).join(', ');
    const autoWentWell = `Successfully completed ${metrics.completedTasksCount} key tasks${topCompletedTaskTitles ? ` including "${topCompletedTaskTitles}"` : ''}. Maintained a ${metrics.habitsCompletedRate}% habit execution rate across technical study routines. Active project momentum on ${topProjects || 'core B.Tech learning'}.`;

    // Auto-synthesize "What Didn't Go Well"
    const overdueCount = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length;
    const autoDidntGoWell = overdueCount > 0
      ? `Faced slight delays with ${overdueCount} overdue tasks requiring focus realignment. Need to allocate dedicated time blocks for Cloud & VLSI lab practice.`
      : `Minor context switching between college assignments and personal cloud lab builds. Need to optimize focus blocks.`;

    // Auto-synthesize "Next Week Focus"
    const upcomingHighPriority = tasks.filter((t) => t.priority === 'high' || t.priority === 'critical').slice(0, 2).map((t) => t.title).join(', ');
    const autoNextWeek = `Prioritize critical tasks: ${upcomingHighPriority || 'AWS certification prep and semester lab reports'}. Target a 90%+ habit completion rate and finish active project milestones.`;

    // Save directly into store
    store.addWeeklyReview({
      weekEndingDate: todayStr,
      tasksCompletedCount: metrics.completedTasksCount,
      projectsProgressedCount: metrics.activeProjectsCount,
      skillsPracticedCount: metrics.skillsPracticedCount,
      habitsCompletedRate: metrics.habitsCompletedRate,
      whatWentWell: autoWentWell,
      whatDidntGoWell: autoDidntGoWell,
      nextWeekFocus: autoNextWeek
    });

    alert('✨ Automatic Weekly Review generated and saved to your history!');
  };

  // Open modal with prefilled automated data for manual customization
  const handleOpenManualModal = () => {
    setWeekEndingDate(todayStr);
    setCustomTasksCount(currentMetrics.completedTasksCount);
    setCustomProjectsCount(currentMetrics.activeProjectsCount);
    setCustomSkillsCount(currentMetrics.skillsPracticedCount);
    setCustomHabitRate(currentMetrics.habitsCompletedRate);
    setWhatWentWell(`Completed key B.Tech learning milestones and kept habit streaks consistent.`);
    setWhatDidntGoWell(`Faced minor time management friction between exams and coding labs.`);
    setNextWeekFocus(`Focus on Cloud architecture certifications and main semester lab submissions.`);
    setIsModalOpen(true);
  };

  const handleSaveManualReview = (e: React.FormEvent) => {
    e.preventDefault();
    store.addWeeklyReview({
      weekEndingDate,
      tasksCompletedCount: customTasksCount,
      projectsProgressedCount: customProjectsCount,
      skillsPracticedCount: customSkillsCount,
      habitsCompletedRate: customHabitRate,
      whatWentWell,
      whatDidntGoWell,
      nextWeekFocus
    });
    setIsModalOpen(false);
  };

  const handleCopyReview = (review: WeeklyReview) => {
    const text = `📅 WEEKLY REVIEW (${review.weekEndingDate})\n\n📊 Metrics:\n- Tasks Completed: ${review.tasksCompletedCount}\n- Projects Progressed: ${review.projectsProgressedCount}\n- Habit Rate: ${review.habitsCompletedRate}%\n\n🟢 What Went Well:\n${review.whatWentWell}\n\n🔴 What Didn't Go Well:\n${review.whatDidntGoWell}\n\n🔵 Next Week Focus:\n${review.nextWeekFocus}`;
    navigator.clipboard.writeText(text);
    setCopiedId(review.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner Overview */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-[var(--bg-surface-subtle)] via-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-main)] shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Automatic Review Engine
              </span>
              <span className="text-xs text-[var(--text-muted)]">• Week Ending: {todayStr}</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Automatic Weekly Review & Reflection
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xl mt-1">
              Auto-aggregate past 7 days of B.Tech tasks, project milestones, and habit consistency into a structured reflection report.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleAutoGenerateReview}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate Weekly Review
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleOpenManualModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Custom Review Entry
            </Button>
          </div>
        </div>
      </div>

      {/* AUTOMATED PAST 7 DAYS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <Card p-4 className="space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Tasks Done
            </span>
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              7 Days
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {currentMetrics.completedTasksCount}
          </div>
          <div className="w-full bg-[var(--bg-surface-hover)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, currentMetrics.completedTasksCount * 12)}%` }}
            />
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Completed in current week</div>
        </Card>

        {/* Metric 2 */}
        <Card p-4 className="space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" /> Active Projects
            </span>
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {currentMetrics.activeProjectsCount}
          </div>
          <div className="w-full bg-[var(--bg-surface-hover)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, currentMetrics.activeProjectsCount * 25)}%` }}
            />
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Projects making velocity</div>
        </Card>

        {/* Metric 3 */}
        <Card p-4 className="space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Skills Practiced
            </span>
            <span className="text-[10px] font-semibold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">
              Topics
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {currentMetrics.skillsPracticedCount}
          </div>
          <div className="w-full bg-[var(--bg-surface-hover)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, currentMetrics.skillsPracticedCount * 20)}%` }}
            />
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Active technical topics</div>
        </Card>

        {/* Metric 4 */}
        <Card p-4 className="space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Habit Rate
            </span>
            <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Consistency
            </span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {currentMetrics.habitsCompletedRate}%
          </div>
          <div className="w-full bg-[var(--bg-surface-hover)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentMetrics.habitsCompletedRate}%` }}
            />
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Execution across 7 days</div>
        </Card>

        {/* Metric 5: Weekly Productivity Score */}
        <Card p-4 className="space-y-2 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border-[var(--border-strong)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Sprint Grade
            </span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-black ${scoreInfo.color}`}>
              Grade {scoreInfo.grade}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--text-primary)]">
              {overallProductivityScore} <span className="text-xs text-[var(--text-muted)] font-normal">/ 100</span>
            </div>
            <div className="text-[10px] font-semibold text-[var(--text-secondary)] mt-0.5">
              {scoreInfo.label}
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Calculated from tasks & habits</div>
        </Card>
      </div>

      {/* WEEKLY REVIEWS HISTORY LOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            Weekly Review History Log ({weeklyReviews.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Chronological Archive</span>
        </div>

        {weeklyReviews.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
            <RotateCcw className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="font-semibold text-[var(--text-primary)]">No weekly reviews recorded yet.</p>
            <p>Click "Generate Weekly Review" above to automatically create your first weekly summary.</p>
          </Card>
        ) : (
          weeklyReviews.map((rev) => (
            <Card
              key={rev.id}
              className="p-5 relative overflow-hidden bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all space-y-4 shadow-sm"
            >
              {/* Review Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-main)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm">
                    🗓️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Weekly Digest • Week Ending {rev.weekEndingDate}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                      <span>✓ {rev.tasksCompletedCount} Tasks Completed</span>
                      <span>•</span>
                      <span>🚀 {rev.projectsProgressedCount} Projects Progressed</span>
                      <span>•</span>
                      <span>🔥 {rev.habitsCompletedRate}% Habit Consistency</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyReview(rev)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                    title="Copy Summary"
                  >
                    {copiedId === rev.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>{copiedId === rev.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => store.deleteWeeklyReview(rev.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3 Reflection Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wins */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> What Went Well
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                    {rev.whatWentWell}
                  </p>
                </div>

                {/* Challenges */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> What Needs Improvement
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                    {rev.whatDidntGoWell}
                  </p>
                </div>

                {/* Next Focus */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <Target className="w-4 h-4" /> Next Week Strategy Focus
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                    {rev.nextWeekFocus}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MANUAL / EDITING REVIEW MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Custom Weekly Review Entry"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveManualReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Week Ending Date
            </label>
            <input
              type="date"
              value={weekEndingDate}
              onChange={(e) => setWeekEndingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Tasks Completed
              </label>
              <input
                type="number"
                value={customTasksCount}
                onChange={(e) => setCustomTasksCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Habit Rate (%)
              </label>
              <input
                type="number"
                value={customHabitRate}
                onChange={(e) => setCustomHabitRate(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              What Went Well (Wins & Accomplishments)
            </label>
            <textarea
              rows={3}
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              What Didn't Go Well (Friction & Delays)
            </label>
            <textarea
              rows={3}
              value={whatDidntGoWell}
              onChange={(e) => setWhatDidntGoWell(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Next Week Strategic Focus
            </label>
            <textarea
              rows={3}
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
