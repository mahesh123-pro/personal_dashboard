import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Play,
  Plus,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trophy,
  Calendar,
  BarChart3,
  Trash2,
  Check,
  User,
  Scale,
  Activity,
  Layers,
  Search,
  BookOpen
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type {
  MuscleGroup,
  EquipmentType
} from '../../types';

export const GymView: React.FC = () => {
  const {
    gymProfile,
    workoutPrograms,
    workoutSessions,
    exercises,
    personalRecords,
    bodyMetrics
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'workout_mode' | 'programs' | 'exercises' | 'prs' | 'metrics' | 'history' | 'analytics' | 'profile'
  >('dashboard');

  // Active Live Workout Session State
  const [activeSessionDayName, setActiveSessionDayName] = useState<string>('Push Day');
  const [activeSessionExercises, setActiveSessionExercises] = useState<
    {
      exerciseId: string;
      exerciseName: string;
      targetMuscle: MuscleGroup;
      sets: { setNumber: number; weightKg: number; reps: number; rpe: number; completed: boolean }[];
      notes?: string;
    }[]
  >([]);
  const [workoutTimerSeconds, setWorkoutTimerSeconds] = useState<number>(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);
  const [restPresetSelected] = useState<number>(90); // default 90s

  // Modal Controls
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

  // Search & Filter States
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');
  const [unitSystem, setUnitSystem] = useState<'kg' | 'lb'>('kg');

  // Form States
  const todayStr = new Date().toISOString().split('T')[0];

  // Body Metric Form
  const [metricWeight, setMetricWeight] = useState<number>(69.5);
  const [metricHeight] = useState<number>(175);
  const [metricChest, setMetricChest] = useState<number>(96.5);
  const [metricWaist] = useState<number>(79);
  const [metricArms, setMetricArms] = useState<number>(32.5);
  const [metricNotes] = useState('');

  // Exercise Form
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('Barbell');
  const [newExInstructions, setNewExInstructions] = useState('');

  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Active Workout Timer Effect
  useEffect(() => {
    if (isWorkoutActive) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    }
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isWorkoutActive]);

  // Rest Timer Effect
  useEffect(() => {
    if (isRestTimerRunning && restTimerSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
            setIsRestTimerRunning(false);
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isRestTimerRunning, restTimerSeconds]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert kg <-> lb helper
  const formatWeight = (kg: number) => {
    if (unitSystem === 'lb') {
      return `${Math.round(kg * 2.20462)} lb`;
    }
    return `${kg} kg`;
  };

  // ----------------------------------------------------
  // START WORKOUT SESSION HANDLER
  // ----------------------------------------------------
  const handleStartWorkout = (dayName: string = 'Push Day') => {
    setActiveSessionDayName(dayName);
    const activeProgram = workoutPrograms.find((p) => p.status === 'active') || workoutPrograms[0];
    const programDay = activeProgram?.days.find((d) => d.dayName.toLowerCase().includes(dayName.toLowerCase())) || activeProgram?.days[0];

    if (programDay && programDay.exercises.length > 0) {
      const initialExs = programDay.exercises.map((pe) => {
        const prevSession = workoutSessions.find((ws) => ws.exercises.some((e) => e.exerciseId === pe.exerciseId));
        const prevEx = prevSession?.exercises.find((e) => e.exerciseId === pe.exerciseId);

        const defaultSets = [];
        for (let i = 1; i <= pe.targetSets; i++) {
          const prevSet = prevEx?.sets[i - 1];
          defaultSets.push({
            setNumber: i,
            weightKg: prevSet ? prevSet.weightKg : (pe.targetWeightKg || 60),
            reps: prevSet ? prevSet.reps : 10,
            rpe: pe.targetRpe || 8,
            completed: false
          });
        }

        return {
          exerciseId: pe.exerciseId,
          exerciseName: pe.exerciseName,
          targetMuscle: pe.targetMuscle,
          sets: defaultSets
        };
      });
      setActiveSessionExercises(initialExs);
    } else {
      // Default Push Exercises
      setActiveSessionExercises([
        {
          exerciseId: 'ex-1',
          exerciseName: 'Barbell Bench Press',
          targetMuscle: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 60, reps: 10, rpe: 8, completed: false },
            { setNumber: 2, weightKg: 65, reps: 10, rpe: 8, completed: false },
            { setNumber: 3, weightKg: 65, reps: 8, rpe: 9, completed: false }
          ]
        },
        {
          exerciseId: 'ex-2',
          exerciseName: 'Incline Dumbbell Press',
          targetMuscle: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 24, reps: 10, rpe: 8, completed: false },
            { setNumber: 2, weightKg: 24, reps: 10, rpe: 8, completed: false }
          ]
        }
      ]);
    }

    setWorkoutTimerSeconds(0);
    setIsWorkoutActive(true);
    setActiveTab('workout_mode');
  };

  // Toggle Live Set Completion & Start Rest Timer
  const handleToggleLiveSet = (exIndex: number, setIndex: number) => {
    const updated = [...activeSessionExercises];
    const targetSet = updated[exIndex].sets[setIndex];
    targetSet.completed = !targetSet.completed;

    if (targetSet.completed) {
      setRestTimerSeconds(restPresetSelected);
      setIsRestTimerRunning(true);
    }

    setActiveSessionExercises(updated);
  };

  // Update Set Weight or Reps
  const handleUpdateLiveSet = (exIndex: number, setIndex: number, field: 'weightKg' | 'reps' | 'rpe', value: number) => {
    const updated = [...activeSessionExercises];
    updated[exIndex].sets[setIndex][field] = value;
    setActiveSessionExercises(updated);
  };

  // Add Set to Exercise in Live Mode
  const handleAddLiveSet = (exIndex: number) => {
    const updated = [...activeSessionExercises];
    const exSets = updated[exIndex].sets;
    const lastSet = exSets[exSets.length - 1];
    exSets.push({
      setNumber: exSets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 60,
      reps: lastSet ? lastSet.reps : 10,
      rpe: 8,
      completed: false
    });
    setActiveSessionExercises(updated);
  };

  // Finish Workout Session Action
  const handleFinishWorkout = () => {
    setIsWorkoutActive(false);
    setIsRestTimerRunning(false);

    let totalVol = 0;
    let totalSetsCount = 0;
    let completedSetsCount = 0;

    activeSessionExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        totalSetsCount++;
        if (s.completed) {
          completedSetsCount++;
          totalVol += s.weightKg * s.reps;
        }
      });
    });

    const durationMins = Math.max(1, Math.round(workoutTimerSeconds / 60));

    store.saveWorkoutSession({
      dayName: activeSessionDayName,
      date: todayStr,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMins,
      exercises: activeSessionExercises,
      totalVolumeKg: totalVol,
      totalSets: totalSetsCount,
      completedSets: completedSetsCount,
      notes: `Completed ${completedSetsCount}/${totalSetsCount} sets in ${durationMins} minutes.`
    });

    alert(`🎉 Workout Session Saved! Total Volume: ${totalVol} kg logged across ${completedSetsCount} sets.`);
    setActiveTab('dashboard');
  };

  // ----------------------------------------------------
  // COMPUTED STATS FOR DASHBOARD & ANALYTICS
  // ----------------------------------------------------
  const currentWeekSessions = workoutSessions.filter((ws) => {
    const d = new Date(ws.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  });

  const totalWeeklyVolumeKg = currentWeekSessions.reduce((sum, s) => sum + s.totalVolumeKg, 0);
  const activeProgram = workoutPrograms.find((p) => p.status === 'active') || workoutPrograms[0];
  const latestBodyMetric = bodyMetrics[0] || { weightKg: 69.5, heightCm: 175 };

  // Calculate Muscle Group Volume Breakdown
  const muscleGroupVolumeMap: Record<string, number> = {};
  currentWeekSessions.forEach((ws) => {
    ws.exercises.forEach((ex) => {
      const muscle = ex.targetMuscle || 'Chest';
      const setsDone = ex.sets.filter((s) => s.completed).length;
      muscleGroupVolumeMap[muscle] = (muscleGroupVolumeMap[muscle] || 0) + setsDone;
    });
  });

  const handleAddMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addBodyMetric({
      date: todayStr,
      weightKg: metricWeight,
      heightCm: metricHeight,
      chestCm: metricChest,
      waistCm: metricWaist,
      armsCm: metricArms,
      notes: metricNotes || 'Manual metric log'
    });
    setIsMetricModalOpen(false);
  };

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    store.addExerciseItem({
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      equipment: newExEquipment,
      instructions: newExInstructions.trim() || undefined
    });

    setNewExName('');
    setNewExInstructions('');
    setIsExerciseModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-[var(--bg-surface-subtle)] via-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-main)] shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" /> Gym & Fitness Module
              </span>
              <span className="text-xs text-[var(--text-muted)]">• {gymProfile.currentPhase}</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Personal Workout & Fitness Engine
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xl mt-1">
              Track progressive overload, manage workout splits, log one-handed live sessions, and analyze body metric trends.
            </p>
          </div>

          {/* Primary Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleStartWorkout('Push Day')}
              icon={<Play className="w-5 h-5 fill-current" />}
            >
              Start Workout Now
            </Button>
          </div>
        </div>

        {/* Live Rest Timer Bar */}
        {isRestTimerRunning && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Clock className="w-4 h-4" />
              <span>REST TIMER: {formatTime(restTimerSeconds)}</span>
            </div>
            <button
              onClick={() => setIsRestTimerRunning(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Skip Rest
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[var(--border-main)]">
        {[
          { id: 'dashboard', label: 'Gym Home', icon: <Dumbbell className="w-4 h-4" /> },
          { id: 'workout_mode', label: 'Live Workout', icon: <Play className="w-4 h-4" />, badge: isWorkoutActive ? 'LIVE' : undefined },
          { id: 'programs', label: 'Programs & Days', icon: <Layers className="w-4 h-4" /> },
          { id: 'exercises', label: 'Exercise Library', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'prs', label: 'Personal Records', icon: <Trophy className="w-4 h-4" /> },
          { id: 'metrics', label: 'Body Metrics', icon: <Scale className="w-4 h-4" /> },
          { id: 'history', label: 'Workout History', icon: <Calendar className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'profile', label: 'Gym Profile', icon: <User className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. GYM DASHBOARD TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-500" /> Current Program
              </div>
              <div className="text-sm font-black text-[var(--text-primary)] truncate">
                {activeProgram?.name || 'Push Pull Legs'}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">{gymProfile.trainingDaysPerWeek} Days / Week</div>
            </Card>

            <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Weekly Volume
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">
                {totalWeeklyVolumeKg.toLocaleString()} <span className="text-xs font-semibold text-[var(--text-muted)]">kg</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">{currentWeekSessions.length} Workouts Done</div>
            </Card>

            <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-500" /> Body Weight
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">
                {latestBodyMetric.weightKg || 69.5} <span className="text-xs font-semibold text-[var(--text-muted)]">kg</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">+1.5 kg this month</div>
            </Card>

            <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" /> Gym Streak
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-1">
                🔥 8 Days
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">Active consistency</div>
            </Card>
          </div>

          {/* Today's Workout Focus Card */}
          <Card className="p-6 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border-[var(--accent-primary)]/30 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Scheduled Session Today
                </span>
                <h3 className="text-xl font-black text-[var(--text-primary)] mt-0.5">
                  Push Day (Chest, Shoulders, Triceps)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  5 Target Exercises • 17 Planned Sets • Est. 55 mins
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleStartWorkout('Push Day')}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Start Workout
              </Button>
            </div>

            {/* Target exercises list preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[var(--border-main)]">
              {[
                { name: 'Barbell Bench Press', sets: '4 Sets x 8-10 reps', target: '65 kg' },
                { name: 'Incline DB Press', sets: '3 Sets x 10-12 reps', target: '24 kg' },
                { name: 'Shoulder Press', sets: '3 Sets x 10-12 reps', target: '20 kg' },
                { name: 'Lateral Raise', sets: '4 Sets x 12-15 reps', target: '10 kg' },
                { name: 'Triceps Pushdown', sets: '3 Sets x 12-15 reps', target: '25 kg' }
              ].map((ex) => (
                <div key={ex.name} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs space-y-1">
                  <div className="font-bold text-[var(--text-primary)] truncate">{ex.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{ex.sets}</div>
                  <div className="text-[10px] font-semibold text-[var(--accent-primary)]">{ex.target}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Workouts & Progressive Overload Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recent Workouts Log */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Recent Workout Sessions ({workoutSessions.length})
                </h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-[var(--accent-primary)] font-semibold hover:underline">
                  View All History →
                </button>
              </div>

              {workoutSessions.slice(0, 3).map((ws) => (
                <Card key={ws.id} p-4 className="flex items-center justify-between gap-4 bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm">
                      🏋️
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{ws.dayName}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {ws.date} • {ws.durationMins} mins • {ws.completedSets} sets
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[var(--text-primary)]">{ws.totalVolumeKg.toLocaleString()} kg</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">✓ Completed</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Right: Progressive Overload Spotlight */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Progressive Overload Tracking
              </h3>
              <Card className="p-4 space-y-3 bg-[var(--bg-surface)] border-[var(--border-main)]">
                {[
                  { name: 'Barbell Bench Press', prev: '60 kg x 10', curr: '65 kg x 10', diff: '+5 kg' },
                  { name: 'Barbell Back Squat', prev: '100 kg x 8', curr: '110 kg x 8', diff: '+10 kg' },
                  { name: 'Lat Pulldown', prev: '65 kg x 10', curr: '70 kg x 10', diff: '+5 kg' }
                ].map((po) => (
                  <div key={po.name} className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{po.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Prev: {po.prev} → Now: {po.curr}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      {po.diff}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. LIVE ONE-HANDED WORKOUT LOGGING MODE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'workout_mode' && (
        <div className="space-y-6">
          {/* Active Session Header Bar */}
          <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-black text-lg animate-pulse">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">{activeSessionDayName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                    Live Recording
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-[var(--accent-primary)]">⏱️ {formatTime(workoutTimerSeconds)}</span>
                  <span>•</span>
                  <span>One-handed fast logging mode</span>
                </div>
              </div>
            </div>

            <Button variant="primary" size="md" onClick={handleFinishWorkout} icon={<CheckCircle2 className="w-4 h-4" />}>
              Finish & Save Workout
            </Button>
          </div>

          {/* Exercises & Set Entry Table */}
          <div className="space-y-6">
            {activeSessionExercises.map((ex, exIdx) => (
              <Card key={ex.exerciseName} className="p-5 space-y-4 bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-md">
                {/* Exercise Header & Previous Performance comparison */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-main)] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                      Exercise #{exIdx + 1} • {ex.targetMuscle}
                    </span>
                    <h4 className="text-base font-black text-[var(--text-primary)]">{ex.exerciseName}</h4>
                  </div>

                  {/* Previous Performance Comparison Tag */}
                  <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-[11px] text-[var(--text-muted)] font-mono">
                    <span className="font-bold text-[var(--text-secondary)]">Previous:</span> 60kg × 10 • 60kg × 10 • 65kg × 8
                  </div>
                </div>

                {/* FAST LIVE SET TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border-main)] pb-2">
                        <th className="pb-2 w-16">Set</th>
                        <th className="pb-2">Weight ({unitSystem})</th>
                        <th className="pb-2">Reps</th>
                        <th className="pb-2">RPE (1-10)</th>
                        <th className="pb-2 text-right">Complete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-main)]">
                      {ex.sets.map((set, setIdx) => (
                        <tr key={set.setNumber} className={set.completed ? 'bg-emerald-500/5' : ''}>
                          <td className="py-2.5 font-bold text-[var(--text-secondary)]">Set {set.setNumber}</td>
                          <td className="py-2.5">
                            <input
                              type="number"
                              step="0.5"
                              value={set.weightKg}
                              onChange={(e) => handleUpdateLiveSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                            />
                          </td>
                          <td className="py-2.5">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleUpdateLiveSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                              className="w-16 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                            />
                          </td>
                          <td className="py-2.5">
                            <input
                              type="number"
                              step="0.5"
                              value={set.rpe || 8}
                              onChange={(e) => handleUpdateLiveSet(exIdx, setIdx, 'rpe', parseFloat(e.target.value) || 8)}
                              className="w-16 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleToggleLiveSet(exIdx, setIdx)}
                              className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all ml-auto ${
                                set.completed
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {set.completed ? <Check className="w-5 h-5" /> : set.setNumber}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <div className="pt-2 flex justify-start">
                  <Button variant="ghost" size="sm" onClick={() => handleAddLiveSet(exIdx)} icon={<Plus className="w-3.5 h-3.5" />}>
                    Add Extra Set
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. WORKOUT PROGRAMS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
              Workout Programs & Routines ({workoutPrograms.length})
            </h3>
            <Button variant="primary" size="sm" onClick={() => setIsProgramModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Create Program
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutPrograms.map((prog) => (
              <Card key={prog.id} className="p-5 space-y-4 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {prog.status}
                    </span>
                    <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">{prog.name}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{prog.description}</p>
                  </div>

                  <button onClick={() => store.deleteWorkoutProgram(prog.id)} className="text-[var(--text-muted)] hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Days list */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-main)]">
                  <div className="text-xs font-bold text-[var(--text-secondary)]">Program Routine Days ({prog.days.length})</div>
                  {prog.days.map((day) => (
                    <div key={day.id} className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{day.dayName}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{day.exercises.length} Exercises</div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleStartWorkout(day.dayName)} icon={<Play className="w-3.5 h-3.5" />}>
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. EXERCISE LIBRARY TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none w-44"
                />
              </div>

              <select
                value={muscleFilter}
                onChange={(e) => setMuscleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="all">All Muscles</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Legs">Legs</option>
                <option value="Core">Core</option>
              </select>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsExerciseModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add Custom Exercise
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises
              .filter((ex) => {
                if (muscleFilter !== 'all' && ex.muscleGroup !== muscleFilter) return false;
                if (exerciseSearchQuery && !ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase())) return false;
                return true;
              })
              .map((ex) => (
                <Card key={ex.id} className="p-4 space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">{ex.equipment}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{ex.name}</h4>
                  {ex.instructions && <p className="text-xs text-[var(--text-muted)] line-clamp-2">{ex.instructions}</p>}

                  <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>PB: {ex.personalBestWeightKg || 0} kg</span>
                    <span>Sessions: {ex.totalSessionsCount}</span>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. PERSONAL RECORDS (PR) TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Personal Best Records Showcase ({personalRecords.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalRecords.map((pr) => (
              <Card key={pr.id} className="p-5 space-y-3 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                    PR Badge
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{pr.achievedDate}</span>
                </div>

                <h4 className="text-base font-bold text-[var(--text-primary)]">{pr.exerciseName}</h4>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-main)] text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)]">Heaviest Weight</span>
                    <div className="font-black text-lg text-[var(--text-primary)]">{formatWeight(pr.heaviestWeightKg)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)]">Estimated 1RM</span>
                    <div className="font-black text-lg text-[var(--accent-primary)]">{formatWeight(pr.estimated1RMKg)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. BODY METRICS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--accent-primary)]" />
              Body Weight & Measurements History ({bodyMetrics.length})
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnitSystem(unitSystem === 'kg' ? 'lb' : 'kg')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-secondary)]"
              >
                Unit: {unitSystem.toUpperCase()}
              </button>
              <Button variant="primary" size="sm" onClick={() => setIsMetricModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                Record Metrics
              </Button>
            </div>
          </div>

          <Card className="p-4 overflow-x-auto bg-[var(--bg-surface)] border-[var(--border-main)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border-main)] pb-2">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2">Chest</th>
                  <th className="pb-2">Waist</th>
                  <th className="pb-2">Arms</th>
                  <th className="pb-2">Notes</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {bodyMetrics.map((bm) => (
                  <tr key={bm.id}>
                    <td className="py-2.5 font-bold text-[var(--text-primary)]">{bm.date}</td>
                    <td className="py-2.5 font-black text-[var(--accent-primary)]">{formatWeight(bm.weightKg || 0)}</td>
                    <td className="py-2.5">{bm.chestCm ? `${bm.chestCm} cm` : '-'}</td>
                    <td className="py-2.5">{bm.waistCm ? `${bm.waistCm} cm` : '-'}</td>
                    <td className="py-2.5">{bm.armsCm ? `${bm.armsCm} cm` : '-'}</td>
                    <td className="py-2.5 text-[var(--text-muted)]">{bm.notes || '-'}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => store.deleteBodyMetric(bm.id)} className="text-[var(--text-muted)] hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. WORKOUT HISTORY TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
              Complete Workout History Log ({workoutSessions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {workoutSessions.map((ws) => (
              <Card key={ws.id} className="p-4 space-y-3 bg-[var(--bg-surface)] border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{ws.dayName}</h4>
                    <span className="text-[11px] text-[var(--text-muted)]">{ws.date} • Duration: {ws.durationMins} mins</span>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[var(--text-primary)]">{ws.totalVolumeKg.toLocaleString()} kg</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{ws.completedSets} Sets Completed</div>
                  </div>
                </div>

                {ws.notes && <p className="text-xs text-[var(--text-muted)] italic">{ws.notes}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. GYM ANALYTICS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Training & Volume Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Volume by Muscle Group (Sets This Week)">
              <div className="space-y-2 pt-2">
                {['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs'].map((m) => {
                  const sets = muscleGroupVolumeMap[m] || 8;
                  return (
                    <div key={m} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{m}</span>
                        <span>{sets} sets</span>
                      </div>
                      <div className="w-full bg-[var(--bg-surface-hover)] h-2 rounded-full overflow-hidden">
                        <div className="bg-[var(--accent-primary)] h-full rounded-full" style={{ width: `${Math.min(100, sets * 5)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. GYM PROFILE TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'profile' && (
        <Card title="Personal Gym Profile & Preferences" className="max-w-2xl">
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Fitness Goal</label>
                <div className="font-bold text-[var(--text-primary)]">{gymProfile.fitnessGoal}</div>
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Experience Level</label>
                <div className="font-bold text-[var(--text-primary)]">{gymProfile.experienceLevel}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Gym Name</label>
                <div className="font-bold text-[var(--text-primary)]">{gymProfile.gymName}</div>
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Current Training Phase</label>
                <div className="font-bold text-[var(--text-primary)]">{gymProfile.currentPhase}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* RECORD BODY METRIC MODAL */}
      <Modal isOpen={isMetricModalOpen} onClose={() => setIsMetricModalOpen(false)} title="Record Body Metrics" maxWidth="sm">
        <form onSubmit={handleAddMetricSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={metricWeight}
              onChange={(e) => setMetricWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Chest (cm)</label>
              <input
                type="number"
                value={metricChest}
                onChange={(e) => setMetricChest(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Arms (cm)</label>
              <input
                type="number"
                value={metricArms}
                onChange={(e) => setMetricArms(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsMetricModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Save Metrics</Button>
          </div>
        </form>
      </Modal>

      {/* ADD CUSTOM EXERCISE MODAL */}
      <Modal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} title="Add Custom Exercise" maxWidth="sm">
        <form onSubmit={handleAddExerciseSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Exercise Name</label>
            <input
              type="text"
              placeholder="e.g. Hammer Curl"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Muscle Group</label>
              <select
                value={newExMuscle}
                onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
              >
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Legs">Legs</option>
                <option value="Core">Core</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Equipment</label>
              <select
                value={newExEquipment}
                onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]"
              >
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Cable">Cable</option>
                <option value="Machine">Machine</option>
                <option value="Bodyweight">Bodyweight</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsExerciseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Save Exercise</Button>
          </div>
        </form>
      </Modal>

      {/* CREATE PROGRAM MODAL STUB */}
      <Modal isOpen={isProgramModalOpen} onClose={() => setIsProgramModalOpen(false)} title="Create Workout Program" maxWidth="sm">
        <div className="space-y-3 text-xs">
          <p className="text-[var(--text-muted)]">Default Push Pull Legs (PPL) program is currently active. You can customize days and target weights directly in your live sessions.</p>
          <div className="flex justify-end pt-2 border-t border-[var(--border-main)]">
            <Button variant="primary" size="sm" onClick={() => setIsProgramModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
