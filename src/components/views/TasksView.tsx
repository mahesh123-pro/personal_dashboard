import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  Clock,
  Trash2,
  Calendar,
  FolderGit2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Target,
  Flame,
  ChevronDown,
  ChevronUp,
  Coffee,
  Brain,
  Search,
  Check
} from 'lucide-react';

import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Tabs } from '../common/Tabs';
import { Modal } from '../common/Modal';
import type { Priority, TaskCategory } from '../../types';

// Preset Study Quotes for B.Tech Focus
const FOCUS_QUOTES = [
  "“Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.” — Alexander Graham Bell",
  "“It’s not that I’m so smart, it’s just that I stay with problems longer.” — Albert Einstein",
  "“First, solve the problem. Then, write the code.” — John Johnson",
  "“Success in VLSI, Cloud & Systems requires persistent deep work daily.”",
  "“Small daily improvements over time lead to stunning long-term results.”"
];

// Ambient Soundscapes
const SOUNDSCAPES = [
  { id: 'rain', name: 'Cyber Rain', icon: '🌧️' },
  { id: 'lofi', name: 'Lo-Fi Chill', icon: '🎧' },
  { id: 'space', name: 'Deep Space', icon: '🌌' },
  { id: 'coffee', name: 'Study Cafe', icon: '☕' }
];

export const TasksView: React.FC = () => {
  const { tasks, projects } = useDashboardStore();

  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  // Inline Quick Task Creation
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('high');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('learning');

  // Subtask Inline Adder State
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Focus Session Hub State
  const [showFocusHub, setShowFocusHub] = useState<boolean>(true);
  const [initialFocusTime, setInitialFocusTime] = useState<number>(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [isFullscreenFocus, setIsFullscreenFocus] = useState<boolean>(false);
  const [scratchpadNote, setScratchpadNote] = useState<string>('');

  // Stats Counters
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(3);
  const [totalFocusSecondsToday, setTotalFocusSecondsToday] = useState<number>(4500); // 75 mins default

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quoteIndex = Math.floor(Math.random() * FOCUS_QUOTES.length);

  const todayStr = new Date().toISOString().split('T')[0];

  // Sync selected task if none chosen
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const firstUncompleted = tasks.find((t) => t.status !== 'completed') || tasks[0];
      setSelectedTaskId(firstUncompleted.id);
    }
  }, [tasks, selectedTaskId]);

  // Timer Interval Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimerRunning(false);
            // Increment completed session stats
            setSessionsCompletedToday((s) => s + 1);
            setTotalFocusSecondsToday((sec) => sec + initialFocusTime);
            // Play notification sound / alert
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch (e) {
              // ignore audio error
            }
            alert('🎉 Focus Session Completed! Take a well-deserved break or start your next sprint.');
            return initialFocusTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, initialFocusTime]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Preset Setter
  const handleSetTimerPreset = (minutes: number) => {
    const totalSecs = minutes * 60;
    setIsTimerRunning(false);
    setInitialFocusTime(totalSecs);
    setTimeRemaining(totalSecs);
  };

  // Toggle Timer
  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(initialFocusTime);
  };

  // Quick Inline Task Add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    store.addTask({
      title: quickInput.trim(),
      priority: quickPriority,
      status: 'not_started',
      dueDate: todayStr,
      category: quickCategory,
      tags: ['todo-session'],
      estimatedHours: 1,
      actualHours: 0,
      subtasks: [],
      isRecurring: false
    });

    setQuickInput('');
  };

  // Subtask Handlers
  const handleAddSubtaskInline = (taskId: string) => {
    const val = subtaskInputs[taskId];
    if (val && val.trim()) {
      store.addSubtask(taskId, val);
      setSubtaskInputs({ ...subtaskInputs, [taskId]: '' });
    }
  };

  const toggleTaskExpansion = (id: string) => {
    const next = new Set(expandedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTaskIds(next);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query);
      const matchCat = task.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    if (activeTab === 'today' && task.dueDate !== todayStr) return false;
    if (activeTab === 'upcoming' && task.dueDate <= todayStr) return false;
    if (activeTab === 'overdue' && (task.dueDate >= todayStr || task.status === 'completed')) return false;
    if (activeTab === 'completed' && task.status !== 'completed') return false;

    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sortBy === 'dueDate') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const overdueCount = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length;
  const todayCount = tasks.filter((t) => t.dueDate === todayStr).length;
  const activeFocusTask = tasks.find((t) => t.id === selectedTaskId);

  // SVG Progress Ring Parameters
  const ringRadius = 72;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (timeRemaining / initialFocusTime) * ringCircumference;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Focus Workstation Overview */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-[var(--bg-surface-subtle)] via-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-main)] shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center gap-1">
                <Brain className="w-3 h-3" /> Focus Session Hub
              </span>
              <span className="text-xs text-[var(--text-muted)]">• Daily Deep Work Center</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              To-Do & Focus Session Workstation
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xl mt-1">
              Execute high-impact B.Tech tasks with targeted Pomodoro focus sprints, ambient study soundscapes, and real-time subtask checklists.
            </p>
          </div>

          {/* Session Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-main)] shadow-xs">
            <div className="px-3 py-1.5 border-r border-[var(--border-main)] last:border-0">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" /> Focus Time
              </div>
              <div className="text-sm font-black text-[var(--text-primary)] mt-0.5">
                {Math.floor(totalFocusSecondsToday / 3600)}h {Math.floor((totalFocusSecondsToday % 3600) / 60)}m
              </div>
            </div>

            <div className="px-3 py-1.5 border-r border-[var(--border-main)] last:border-0">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Sessions
              </div>
              <div className="text-sm font-black text-[var(--text-primary)] mt-0.5">
                {sessionsCompletedToday} Sprints
              </div>
            </div>

            <div className="px-3 py-1.5 border-r border-[var(--border-main)] last:border-0">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Done Today
              </div>
              <div className="text-sm font-black text-[var(--text-primary)] mt-0.5">
                {tasks.filter((t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr)).length} / {tasks.length}
              </div>
            </div>

            <div className="px-3 py-1.5">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" /> Streak
              </div>
              <div className="text-sm font-black text-[var(--text-primary)] mt-0.5 flex items-center gap-1">
                🔥 5 Days
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Focus Session Hub Bar */}
        <div className="mt-5 pt-4 border-t border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Target className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Active Sprint Target:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] focus:outline-none max-w-xs font-medium truncate"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.status === 'completed' ? '✓ ' : ''}{t.title} ({t.priority.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFocusHub(!showFocusHub)}
              icon={showFocusHub ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            >
              {showFocusHub ? 'Hide Timer Hub' : 'Open Timer Hub'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFullscreenFocus(true)}
              icon={<Maximize2 className="w-3.5 h-3.5" />}
            >
              Zen Focus Mode
            </Button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE FOCUS SESSION TIMER HUB */}
      {showFocusHub && (
        <Card className="p-6 relative overflow-hidden bg-[var(--bg-surface)] border-[var(--accent-primary)]/20 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Timer Ring */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-[var(--border-main)]">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r={ringRadius}
                    className="stroke-[var(--bg-surface-hover)]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r={ringRadius}
                    className="stroke-[var(--accent-primary)] transition-all duration-1000 ease-linear"
                    strokeWidth="10"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-black text-[var(--text-primary)] tracking-wider font-mono">
                    {formatTimer(timeRemaining)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] mt-1">
                    {isTimerRunning ? '⚡ FOCUS RUNNING' : '⏸️ SESSION PAUSED'}
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 mt-4">
                {[
                  { label: '25m Focus', mins: 25 },
                  { label: '50m Deep', mins: 50 },
                  { label: '5m Break', mins: 5 },
                  { label: '15m Break', mins: 15 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSetTimerPreset(preset.mins)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      initialFocusTime === preset.mins * 60
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Timer Action Buttons */}
              <div className="flex items-center gap-3 mt-5">
                <Button
                  variant={isTimerRunning ? 'outline' : 'primary'}
                  size="md"
                  onClick={handleToggleTimer}
                  icon={isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {isTimerRunning ? 'Pause Session' : 'Start Focus Session'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleResetTimer}
                  icon={<RotateCcw className="w-4 h-4" />}
                  title="Reset Timer"
                />
              </div>
            </div>

            {/* Right: Active Target Task Details & Soundscapes */}
            <div className="lg:col-span-7 space-y-4">
              {activeFocusTask ? (
                <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Current Sprint Objective
                    </span>
                    <PriorityBadge priority={activeFocusTask.priority} />
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {activeFocusTask.title}
                  </h3>

                  {activeFocusTask.description && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {activeFocusTask.description}
                    </p>
                  )}

                  {/* Subtask checklist in focus banner */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-main)]">
                    <div className="text-[11px] font-bold text-[var(--text-secondary)] flex justify-between items-center">
                      <span>Task Sub-Checklist</span>
                      <span>
                        {activeFocusTask.subtasks.filter((s) => s.completed).length} / {activeFocusTask.subtasks.length} Done
                      </span>
                    </div>

                    {activeFocusTask.subtasks.length === 0 ? (
                      <p className="text-[11px] text-[var(--text-muted)] italic">
                        No subtasks added yet. Add checklist items below to stay structured.
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {activeFocusTask.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => store.toggleSubtask(activeFocusTask.id, st.id)}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] cursor-pointer hover:border-[var(--border-strong)] transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded flex items-center justify-center border ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[var(--border-strong)]'}`}>
                                {st.completed && <Check className="w-3 h-3" />}
                              </span>
                              <span className={st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}>
                                {st.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Finish & Advance */}
                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => store.toggleTaskComplete(activeFocusTask.id)}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      {activeFocusTask.status === 'completed' ? 'Mark Task Incomplete' : 'Complete Sprint Task'}
                    </Button>

                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. {activeFocusTask.estimatedHours}h
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                  No task selected. Choose a task from your list to activate focus tracking.
                </div>
              )}

              {/* Ambient Soundscapes Bar */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                  {activeSoundscape ? <Volume2 className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" /> : <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />}
                  <span>Study Soundscape:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {SOUNDSCAPES.map((snd) => (
                    <button
                      key={snd.id}
                      onClick={() => setActiveSoundscape(activeSoundscape === snd.id ? null : snd.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        activeSoundscape === snd.id
                          ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{snd.icon}</span>
                      <span>{snd.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* QUICK INLINE CREATION & SEARCH CONTROLS */}
      <div className="space-y-3">
        <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleQuickAdd} className="flex-1 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="➕ Quick Add Task e.g. Implement AWS DynamoDB tables for project..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as Priority)}
                className="px-2.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none font-medium"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>

              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
                className="px-2.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none font-medium capitalize"
              >
                <option value="learning">Learning</option>
                <option value="project">Project</option>
                <option value="college">College</option>
                <option value="certification">Certification</option>
                <option value="career">Career</option>
                <option value="personal">Personal</option>
              </select>

              <Button variant="primary" size="md" type="submit" icon={<Plus className="w-4 h-4" />}>
                Add Task
              </Button>
            </div>
          </form>
        </div>

        {/* Tabs & Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-3">
          <Tabs
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
            tabs={[
              { id: 'today', label: 'Today', badge: todayCount },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'overdue', label: 'Overdue', badge: overdueCount > 0 ? overdueCount : undefined },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All Tasks', badge: tasks.length }
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] w-36 sm:w-44"
              />
            </div>

            {/* Filters */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="learning">Learning</option>
              <option value="project">Project</option>
              <option value="college">College</option>
              <option value="certification">Certification</option>
              <option value="career">Career</option>
              <option value="personal">Personal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)]">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1 rounded-md transition-all ${viewMode === 'board' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <Card className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
              <CheckSquare className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="font-semibold">No tasks found matching your filters.</p>
              <p>Add a task using the input box above to build your daily B.Tech workflow.</p>
            </Card>
          ) : (
            sortedTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const isSelectedForFocus = selectedTaskId === task.id;
              const isExpanded = expandedTaskIds.has(task.id);
              const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

              return (
                <div
                  key={task.id}
                  className={`glass-panel p-4 rounded-xl transition-all border ${
                    isSelectedForFocus
                      ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5'
                      : 'border-[var(--border-main)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => store.toggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-0 cursor-pointer mt-1"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              task.status === 'completed'
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {task.title}
                          </span>
                          {isSelectedForFocus && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-primary)] text-white">
                              Active Focus
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{task.description}</p>
                        )}

                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-[var(--text-muted)]" /> {task.dueDate}
                          </span>
                          <span>•</span>
                          <span className="capitalize font-semibold text-[var(--text-secondary)]">{task.category}</span>
                          {project && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-[var(--accent-primary)]">
                                <FolderGit2 className="w-3 h-3" /> {project.name}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.estimatedHours}h estimated
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />

                      {/* Select as Target */}
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setShowFocusHub(true);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelectedForFocus
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs'
                            : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-primary)]'
                        }`}
                        title="Focus on this task"
                      >
                        <Target className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Subtask Details */}
                      <button
                        onClick={() => toggleTaskExpansion(task.id)}
                        className="p-1.5 rounded-lg bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-main)] transition-colors"
                        title="Subtask Checklist"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => store.deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask Drawer */}
                  {(isExpanded || task.subtasks.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-main)] space-y-2 pl-7">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--text-secondary)]">
                          Subtasks Checklist ({completedSubtasks}/{task.subtasks.length})
                        </span>
                      </div>

                      {/* List of subtasks */}
                      <div className="space-y-1.5">
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => store.toggleSubtask(task.id, st.id)}
                                className="w-3.5 h-3.5 rounded text-[var(--accent-primary)] focus:ring-0 cursor-pointer"
                              />
                              <span className={st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-medium'}>
                                {st.title}
                              </span>
                            </div>
                            <button
                              onClick={() => store.deleteSubtask(task.id, st.id)}
                              className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add subtask input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add a subtask step..."
                          value={subtaskInputs[task.id] || ''}
                          onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [task.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubtaskInline(task.id);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddSubtaskInline(task.id)}
                          icon={<Plus className="w-3 h-3" />}
                        >
                          Add Step
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'not_started', label: 'Not Started', color: 'border-slate-300 dark:border-slate-700' },
            { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
            { id: 'blocked', label: 'Blocked', color: 'border-rose-500' },
            { id: 'completed', label: 'Completed', color: 'border-emerald-500' }
          ].map((col) => {
            const colTasks = sortedTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="glass-panel rounded-xl p-3 bg-[var(--bg-surface-subtle)] flex flex-col h-full">
                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {col.label}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[350px]">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs hover:border-[var(--border-strong)] transition-all space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <PriorityBadge priority={t.priority} />
                        <button
                          onClick={() => store.deleteTask(t.id)}
                          className="text-[var(--text-muted)] hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h5 className="text-xs font-bold text-[var(--text-primary)] leading-snug">{t.title}</h5>

                      <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-main)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.dueDate}
                        </span>
                        <span className="capitalize font-semibold text-[var(--text-secondary)]">{t.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN ZEN FOCUS MODE MODAL */}
      <Modal
        isOpen={isFullscreenFocus}
        onClose={() => setIsFullscreenFocus(false)}
        title="Distraction-Free Zen Focus Mode"
        maxWidth="2xl"
      >
        <div className="min-h-[70vh] flex flex-col justify-between p-4 space-y-6 bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface-subtle)] rounded-2xl">
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Zen Study Sprint</h3>
                <p className="text-xs text-[var(--text-muted)]">Locked in focus mode. Zero distractions.</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreenFocus(false)}
              icon={<Minimize2 className="w-4 h-4" />}
            >
              Exit Zen Mode
            </Button>
          </div>

          {/* Central Timer & Active Task Display */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r={100}
                  className="stroke-[var(--bg-surface-hover)]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r={100}
                  className="stroke-[var(--accent-primary)] transition-all duration-1000 ease-linear"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={2 * Math.PI * 100 - (timeRemaining / initialFocusTime) * 2 * Math.PI * 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-[var(--text-primary)] font-mono tracking-widest">
                  {formatTimer(timeRemaining)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] mt-2">
                  {isTimerRunning ? '⚡ FOCUS IN PROGRESS' : '⏸️ SESSION PAUSED'}
                </span>
              </div>
            </div>

            {/* Target task info */}
            {activeFocusTask && (
              <div className="max-w-lg w-full p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">Current Task Target</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{activeFocusTask.title}</h4>
              </div>
            )}

            {/* Timer Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant={isTimerRunning ? 'outline' : 'primary'}
                size="lg"
                onClick={handleToggleTimer}
                icon={isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              >
                {isTimerRunning ? 'Pause Timer' : 'Start Focus Sprint'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleResetTimer}
                icon={<RotateCcw className="w-5 h-5" />}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Bottom Scratchpad Note & Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--border-main)] pt-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-500" /> Focus Motivation
              </span>
              <p className="text-xs italic text-[var(--text-muted)] bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-main)]">
                {FOCUS_QUOTES[quoteIndex]}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-secondary)]">Quick Focus Scratchpad</span>
              <textarea
                rows={2}
                placeholder="Type quick thoughts or code ideas during your sprint..."
                value={scratchpadNote}
                onChange={(e) => setScratchpadNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
