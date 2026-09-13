import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Plus,
  CheckSquare,
  FolderGit2,
  Award,
  Zap,
  Clock,
  AlertTriangle,
  ChevronRight,
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Briefcase,
  CheckCircle2,
  Bot,
  Flame,
  Target,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PriorityBadge, HealthBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import type { ActiveTab, Task } from '../../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAction: (type?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenQuickAction
}) => {
  const {
    profile,
    tasks,
    projects,
    certifications,
    habits,
    notes,
    workoutSessions,
    workoutPrograms,
    jobs
  } = useDashboardStore();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated Metrics (100% Real Data)
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed');
  const activeProjects = projects.filter((p) => p.status === 'active');
  const preparingCerts = certifications.filter((c) => c.status === 'preparing' || c.status === 'exam_scheduled');

  // Habit Streak Summary
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;

  // "Focus Now" Logic: Identify the single most important task right now
  let focusTask: Task | null = null;
  if (overdueTasks.length > 0) {
    focusTask = overdueTasks.sort((a) => (a.priority === 'critical' ? -1 : 1))[0];
  } else if (todayTasks.filter((t) => t.status !== 'completed').length > 0) {
    focusTask = todayTasks
      .filter((t) => t.status !== 'completed')
      .sort((a) => (a.priority === 'critical' || a.priority === 'high' ? -1 : 1))[0];
  } else if (tasks.filter((t) => t.status !== 'completed').length > 0) {
    focusTask = tasks.filter((t) => t.status !== 'completed')[0];
  }

  // Today's Priorities (top 3)
  const priorities = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return pOrder[b.priority] - pOrder[a.priority];
    })
    .slice(0, 3);

  // Time of Day Greeting
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good Evening';
  }

  // DYNAMIC FEATURE 1: Pomodoro Focus Controller State & Timer
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<string>(focusTask?.id || '');
  const [soundscape, setSoundscape] = useState<'off' | 'white_noise' | 'waves'>('off');

  const timerCardRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Handle Pomodoro Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Auto-complete selected focus task if configured
      if (selectedFocusTaskId) {
        store.toggleTaskComplete(selectedFocusTaskId);
      }
      alert('🎉 Focus Session Completed! Take a short break.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, selectedFocusTaskId]);

  // Set Timer Mode Presets
  const handleSetTimerMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    if (mode === 'focus') setTimerSeconds(25 * 60);
    if (mode === 'shortBreak') setTimerSeconds(5 * 60);
    if (mode === 'longBreak') setTimerSeconds(15 * 60);
  };

  // Web Audio Synthesizer for Ambient Soundscapes
  const toggleSoundscape = (type: 'off' | 'white_noise' | 'waves') => {
    if (soundscape === type) {
      setSoundscape('off');
      if (noiseNodeRef.current) {
        try { (noiseNodeRef.current as any).stop(); } catch (e) {}
        noiseNodeRef.current = null;
      }
      return;
    }

    setSoundscape(type);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      if (noiseNodeRef.current) {
        try { (noiseNodeRef.current as any).stop(); } catch (e) {}
        noiseNodeRef.current = null;
      }

      if (type === 'white_noise' || type === 'waves') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'waves' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'waves' ? 400 : 800;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.05;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();
        noiseNodeRef.current = noise as any;
      }
    } catch (e) {
      console.log('Web Audio setup:', e);
    }
  };

  // Scroll to Timer Widget
  const scrollToTimer = () => {
    if (timerCardRef.current) {
      timerCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Format Timer String
  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // DYNAMIC FEATURE 2: AI Daily Intel Schedule Generator
  const [intelSchedule, setIntelSchedule] = useState<{ time: string; activity: string; category: string }[]>([
    { time: '08:30 AM', activity: focusTask ? `Deep Focus: ${focusTask.title}` : 'AWS Cloud Architecture Lab', category: 'Deep Work' },
    { time: '11:30 AM', activity: 'Verilog RTL Hardware Simulation', category: 'Academic' },
    { time: '04:30 PM', activity: workoutPrograms[0]?.name || 'Gym Workout Session (Push Day)', category: 'Fitness' },
    { time: '07:30 PM', activity: 'Placement Job Applications & Review', category: 'Career' }
  ]);
  const [isGeneratingIntel, setIsGeneratingIntel] = useState(false);

  const handleGenerateIntel = () => {
    setIsGeneratingIntel(true);
    setTimeout(() => {
      setIntelSchedule([
        { time: '08:00 AM', activity: overdueTasks.length > 0 ? `🚨 Urgent: ${overdueTasks[0].title}` : 'Cloud Infrastructure Refactoring', category: 'High Priority' },
        { time: '10:30 AM', activity: preparingCerts[0] ? `Cert Prep: ${preparingCerts[0].name}` : 'AWS SAA Practice Exam', category: 'Certification' },
        { time: '02:00 PM', activity: activeProjects[0] ? `Build Milestone: ${activeProjects[0].name}` : 'System Programming', category: 'Project Build' },
        { time: '05:30 PM', activity: 'Gym & Fitness Routine', category: 'Health' },
        { time: '09:00 PM', activity: 'Automatic Weekly Review & Daily Log', category: 'System Review' }
      ]);
      setIsGeneratingIntel(false);
    }, 600);
  };

  // Career Applications Breakdown Metrics
  const appliedJobs = jobs.filter((j) => j.status === 'applied' || j.status === 'interested').length;
  const interviewJobs = jobs.filter((j) => j.status === 'assessment' || j.status === 'interview').length;
  const offerJobs = jobs.filter((j) => j.status === 'selected').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* SECTION 1: DYNAMIC HERO WELCOME & QUICK ACTION LAUNCHPAD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[var(--accent-primary)]/15 via-[var(--bg-surface-subtle)] to-[var(--bg-surface)] border border-[var(--border-main)] shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" /> Live Operating System
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {timeGreeting}, {profile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
              {overdueTasks.length > 0
                ? `You have ${overdueTasks.length} overdue item needing immediate attention.`
                : completedTodayTasks.length > 0
                ? `Great job! You've completed ${completedTodayTasks.length} tasks today.`
                : "Welcome to your command center. Let's make today highly productive!"}
            </p>
          </div>

          {/* QUICK ACTION BUTTONS LAUNCHPAD */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenQuickAction('task')}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              + Quick Task
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToTimer}
              icon={<Clock className="w-3.5 h-3.5 text-blue-500" />}
            >
              Focus Timer
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('gym')}
              icon={<Dumbbell className="w-3.5 h-3.5 text-amber-500" />}
            >
              Log Workout
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('career')}
              icon={<Briefcase className="w-3.5 h-3.5 text-purple-500" />}
            >
              Career Hub
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('weekly_review')}
              icon={<BarChart3 className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Review Week
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: METRICS CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Today's Tasks</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {completedTodayTasks.length} <span className="text-sm font-normal text-[var(--text-muted)]">/ {todayTasks.length}</span>
            </span>
            {overdueTasks.length > 0 && (
              <span className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md">
                {overdueTasks.length} Overdue
              </span>
            )}
          </div>
          <ProgressBar
            progress={todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0}
            size="sm"
            className="mt-3"
          />
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/20 dark:to-teal-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Active Projects</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{activeProjects.length}</span>
            <span className="text-xs text-emerald-600 font-medium">All Healthy</span>
          </div>
          <div className="mt-3 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <span>Avg Progress:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {Math.round(activeProjects.reduce((acc, p) => acc + p.progress, 0) / (activeProjects.length || 1))}%
            </span>
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-purple-50/50 to-pink-50/20 dark:from-purple-950/20 dark:to-pink-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Certifications Prep</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{preparingCerts.length}</span>
            <span className="text-xs text-purple-600 font-medium">In Prep</span>
          </div>
          <div className="mt-3 text-[11px] text-[var(--text-muted)] truncate">
            {preparingCerts[0]?.name || 'AWS Solutions Architect'}
          </div>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Habit Streak</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{maxStreak}</span>
            <span className="text-xs text-[var(--text-muted)]">days streak</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            🔥 Best: {Math.max(...habits.map((h) => h.bestStreak), maxStreak)} continuous days
          </div>
        </Card>
      </div>

      {/* SECTION 3: INLINE LIVE POMODORO FOCUS CONTROLLER WIDGET CARD */}
      <div ref={timerCardRef}>
        <Card className="p-5 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface-subtle)] to-[var(--bg-surface)] border-[var(--border-strong)] shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 font-bold">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Interactive Focus Session Controller</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                  {timerMode === 'focus' ? '25m Focus' : timerMode === 'shortBreak' ? '5m Break' : '15m Rest'}
                </span>
              </div>

              {/* Focus Task Association Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0">Tied Task:</span>
                <select
                  value={selectedFocusTaskId}
                  onChange={(e) => setSelectedFocusTaskId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none flex-1"
                >
                  <option value="">-- Select Task to Focus On --</option>
                  {tasks
                    .filter((t) => t.status !== 'completed')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.priority.toUpperCase()})
                      </option>
                    ))}
                </select>
              </div>

              {/* Ambient Soundscapes Switcher */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  {soundscape !== 'off' ? <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                  Soundscape:
                </span>
                <button
                  onClick={() => toggleSoundscape('off')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    soundscape === 'off' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  Mute
                </button>
                <button
                  onClick={() => toggleSoundscape('white_noise')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    soundscape === 'white_noise' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  White Noise 🎧
                </button>
                <button
                  onClick={() => toggleSoundscape('waves')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    soundscape === 'waves' ? 'bg-blue-600 text-white shadow-xs' : 'bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  Alpha Waves 🌊
                </button>
              </div>
            </div>

            {/* Timer Display & Main Buttons */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] min-w-[200px] shrink-0">
              <div className="text-4xl font-extrabold font-mono text-[var(--text-primary)] tracking-wider">
                {formatTimer(timerSeconds)}
              </div>

              {/* Mode Presets */}
              <div className="flex items-center gap-1 mt-2 mb-3">
                <button
                  onClick={() => handleSetTimerMode('focus')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timerMode === 'focus' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  25m
                </button>
                <button
                  onClick={() => handleSetTimerMode('shortBreak')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timerMode === 'shortBreak' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  5m
                </button>
                <button
                  onClick={() => handleSetTimerMode('longBreak')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timerMode === 'longBreak' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  15m
                </button>
              </div>

              {/* Play / Pause / Reset Action Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  icon={isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                >
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsTimerRunning(false);
                    handleSetTimerMode(timerMode);
                  }}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  title="Reset Timer"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: DYNAMIC HABIT QUICK-CHECK MATRIX */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Habit Tracker Quick-Check Matrix
          </span>
        }
        subtitle="1-click habit check-offs for today"
        action={
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('habits')}>
            Manage Habits <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {habits.slice(0, 4).map((habit) => {
            const isDoneToday = !!habit.logs[todayStr];
            return (
              <div
                key={habit.id}
                onClick={() => store.toggleHabitLog(habit.id, todayStr)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isDoneToday
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-main)] hover:border-[var(--accent-primary)] text-[var(--text-primary)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold truncate max-w-[140px]">{habit.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                    <span>🔥 {habit.currentStreak}d streak</span>
                    <span>•</span>
                    <span>Target: {habit.targetPerWeek}/wk</span>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isDoneToday ? 'bg-emerald-500 text-white shadow-xs' : 'bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)]'
                  }`}
                >
                  {isDoneToday ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SECTION 5: TODAY'S GYM & WORKOUT QUICK STATUS WIDGET */}
      <Card className="p-4 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-subtle)] to-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">Today's Gym Session: Push Day</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                  {workoutPrograms[0]?.name || 'PPL Program'}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                5 exercises • 17 planned sets • Last session: {workoutSessions[0]?.date || 'Yesterday'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button variant="primary" size="sm" onClick={() => setActiveTab('gym')} icon={<Play className="w-3.5 h-3.5 fill-current" />}>
              Start Workout
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('gym')}>
              Gym Hub →
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 6: AUTOMATED AI DAILY INTEL & PLACEMENT TICKER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Priorities & AI Daily Schedule Advisor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priorities List */}
          <Card
            title="Today's Priorities"
            subtitle="Top items needing immediate execution"
            action={
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>
                All Tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {priorities.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] p-4 text-center">
                  No priority tasks remaining! Add a task to get started.
                </div>
              ) : (
                priorities.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => store.toggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>Due {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* DYNAMIC AI DAILY INTEL SCHEDULE ADVISOR */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-500" />
                Automated AI Daily Intel Schedule
              </span>
            }
            subtitle="Smart synthesized timeline based on deadlines & goals"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateIntel}
                disabled={isGeneratingIntel}
                icon={<Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isGeneratingIntel ? 'animate-spin' : ''}`} />}
              >
                {isGeneratingIntel ? 'Synthesizing...' : 'Refresh Intel'}
              </Button>
            }
          >
            <div className="space-y-2.5 pt-1">
              {intelSchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-lg bg-[var(--accent-primary)]/10 font-mono font-bold text-[var(--accent-primary)]">
                      {item.time}
                    </span>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{item.activity}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{item.category}</div>
                    </div>
                  </div>
                  <Target className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          </Card>

          {/* Active Projects Cards */}
          <Card
            title="Active Technical Builds & Projects"
            subtitle="Current software & hardware engineering projects"
            action={
              <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => onOpenQuickAction('project')}>
                New Project
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setActiveTab('projects')}
                  className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {proj.name}
                      </h4>
                      <HealthBadge health={proj.health} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-3">
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1">
                      <span>Tasks: {proj.milestones.filter((m) => m.completed).length} / {proj.milestones.length} milestones</span>
                      <span className="font-bold text-[var(--text-primary)]">{proj.progress}%</span>
                    </div>
                    <ProgressBar progress={proj.progress} size="sm" />

                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.techStack.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-secondary)] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Career Ticker, Deadlines, Notes */}
        <div className="space-y-6">
          {/* CAREER & PLACEMENT TICKER WIDGET */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" />
                Placement Pipeline Ticker
              </span>
            }
            subtitle="Campus placements & job applications"
            action={
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('career')}>
                Career Hub <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400">{appliedJobs}</div>
                  <div className="text-[10px] font-semibold text-[var(--text-muted)]">Applied</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400">{interviewJobs}</div>
                  <div className="text-[10px] font-semibold text-[var(--text-muted)]">Interview</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{offerJobs}</div>
                  <div className="text-[10px] font-semibold text-[var(--text-muted)]">Offers</div>
                </div>
              </div>

              {jobs.slice(0, 2).map((j) => (
                <div
                  key={j.id}
                  onClick={() => setActiveTab('career')}
                  className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">{j.role}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {j.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                    {j.company} • {j.location}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card title="Upcoming Deadlines" subtitle="Next 7 days alerts">
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status !== 'completed')
                .slice(0, 3)
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center justify-between">
                        <span>{t.dueDate}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recent Notes */}
          <Card
            title="Recent Notes"
            subtitle="Knowledge Base captures"
            action={
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('notes')}>
                All Notes <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="space-y-2">
              {notes.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveTab('notes')}
                  className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                >
                  <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {n.title}
                  </h5>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 font-mono">
                    {n.content.replace(/[#*`]/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
