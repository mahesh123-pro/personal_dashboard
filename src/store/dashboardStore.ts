import { useState, useEffect } from 'react';
import type {
  UserProfile,
  Task,
  Project,
  Skill,
  Certification,
  Goal,
  Habit,
  CollegeSubject,
  Note,
  Resource,
  JobApplication,
  ResumeVersion,
  Achievement,
  JournalEntry,
  WeeklyReview,
  CalendarEvent,
  UserDocument,
  AppNotification,
  GymProfile,
  BodyMetricEntry,
  WorkoutProgram,
  WorkoutSession,
  ExerciseItem,
  PersonalRecord
} from '../types';

import {
  initialProfile,
  initialTasks,
  initialProjects,
  initialSkills,
  initialCertifications,
  initialGoals,
  initialHabits,
  initialCollegeSubjects,
  initialNotes,
  initialResources,
  initialJobs,
  initialResumes,
  initialAchievements,
  initialJournalEntries,
  initialWeeklyReviews,
  initialCalendarEvents,
  initialDocuments,
  initialNotifications,
  initialGymProfile,
  initialExercises,
  initialWorkoutPrograms,
  initialWorkoutSessions,
  initialBodyMetrics,
  initialPersonalRecords
} from './initialData';

export interface DashboardState {
  profile: UserProfile;
  tasks: Task[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  goals: Goal[];
  habits: Habit[];
  collegeSubjects: CollegeSubject[];
  notes: Note[];
  resources: Resource[];
  jobs: JobApplication[];
  resumes: ResumeVersion[];
  achievements: Achievement[];
  journalEntries: JournalEntry[];
  weeklyReviews: WeeklyReview[];
  calendarEvents: CalendarEvent[];
  documents: UserDocument[];
  notifications: AppNotification[];
  gymProfile: GymProfile;
  bodyMetrics: BodyMetricEntry[];
  workoutPrograms: WorkoutProgram[];
  workoutSessions: WorkoutSession[];
  exercises: ExerciseItem[];
  personalRecords: PersonalRecord[];
}

const STORAGE_KEY = 'personal_os_dashboard_v1';

function loadInitialState(): DashboardState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        profile: parsed.profile || initialProfile,
        tasks: parsed.tasks || initialTasks,
        projects: parsed.projects || initialProjects,
        skills: parsed.skills || initialSkills,
        certifications: parsed.certifications || initialCertifications,
        goals: parsed.goals || initialGoals,
        habits: parsed.habits || initialHabits,
        collegeSubjects: parsed.collegeSubjects || initialCollegeSubjects,
        notes: parsed.notes || initialNotes,
        resources: parsed.resources || initialResources,
        jobs: parsed.jobs || initialJobs,
        resumes: parsed.resumes || initialResumes,
        achievements: parsed.achievements || initialAchievements,
        journalEntries: parsed.journalEntries || initialJournalEntries,
        weeklyReviews: parsed.weeklyReviews || initialWeeklyReviews,
        calendarEvents: parsed.calendarEvents || initialCalendarEvents,
        documents: parsed.documents || initialDocuments,
        notifications: parsed.notifications || initialNotifications,
        gymProfile: parsed.gymProfile || initialGymProfile,
        bodyMetrics: parsed.bodyMetrics || initialBodyMetrics,
        workoutPrograms: parsed.workoutPrograms || initialWorkoutPrograms,
        workoutSessions: parsed.workoutSessions || initialWorkoutSessions,
        exercises: parsed.exercises || initialExercises,
        personalRecords: parsed.personalRecords || initialPersonalRecords,
      };
    }
  } catch (err) {
    console.error('Failed to load dashboard state from localStorage', err);
  }

  return {
    profile: initialProfile,
    tasks: initialTasks,
    projects: initialProjects,
    skills: initialSkills,
    certifications: initialCertifications,
    goals: initialGoals,
    habits: initialHabits,
    collegeSubjects: initialCollegeSubjects,
    notes: initialNotes,
    resources: initialResources,
    jobs: initialJobs,
    resumes: initialResumes,
    achievements: initialAchievements,
    journalEntries: initialJournalEntries,
    weeklyReviews: initialWeeklyReviews,
    calendarEvents: initialCalendarEvents,
    documents: initialDocuments,
    notifications: initialNotifications,
    gymProfile: initialGymProfile,
    bodyMetrics: initialBodyMetrics,
    workoutPrograms: initialWorkoutPrograms,
    workoutSessions: initialWorkoutSessions,
    exercises: initialExercises,
    personalRecords: initialPersonalRecords,
  };
}

import { syncStateToMongo, fetchStateFromMongo } from '../services/api';

let currentState: DashboardState = loadInitialState();
const listeners = new Set<() => void>();

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
  listeners.forEach((listener) => listener());

  // Asynchronous Debounced Cloud Sync to MongoDB Atlas (500ms debounce)
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncStateToMongo(currentState).catch(() => {});
  }, 500);
}

// Initial Remote Sync on Load
if (typeof window !== 'undefined') {
  fetchStateFromMongo().then((remoteState) => {
    if (remoteState && typeof remoteState === 'object') {
      currentState = { ...currentState, ...remoteState };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      } catch (e) {}
      listeners.forEach((listener) => listener());
    }
  }).catch(() => {});
}

export const store = {
  getState: () => currentState,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Reset & Backup
  resetToDefault: () => {
    currentState = {
      profile: initialProfile,
      tasks: initialTasks,
      projects: initialProjects,
      skills: initialSkills,
      certifications: initialCertifications,
      goals: initialGoals,
      habits: initialHabits,
      collegeSubjects: initialCollegeSubjects,
      notes: initialNotes,
      resources: initialResources,
      jobs: initialJobs,
      resumes: initialResumes,
      achievements: initialAchievements,
      journalEntries: initialJournalEntries,
      weeklyReviews: initialWeeklyReviews,
      calendarEvents: initialCalendarEvents,
      documents: initialDocuments,
      notifications: initialNotifications,
      gymProfile: initialGymProfile,
      bodyMetrics: initialBodyMetrics,
      workoutPrograms: initialWorkoutPrograms,
      workoutSessions: initialWorkoutSessions,
      exercises: initialExercises,
      personalRecords: initialPersonalRecords,
    };
    notify();
  },

  importState: (newState: Partial<DashboardState>) => {
    currentState = { ...currentState, ...newState };
    notify();
  },

  // Profile Action
  updateProfile: (profile: Partial<UserProfile>) => {
    currentState = { ...currentState, profile: { ...currentState.profile, ...profile } };
    notify();
  },

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    currentState = { ...currentState, tasks: [newTask, ...currentState.tasks] };
    
    // Auto-create calendar event
    if (newTask.dueDate) {
      store.addCalendarEvent({
        title: newTask.title,
        date: newTask.dueDate,
        type: 'task',
        priority: newTask.priority,
        completed: newTask.status === 'completed'
      });
    }
    notify();
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    currentState = {
      ...currentState,
      tasks: currentState.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    };
    notify();
  },

  toggleTaskComplete: (id: string) => {
    const now = new Date().toISOString();
    currentState = {
      ...currentState,
      tasks: currentState.tasks.map((t) => {
        if (t.id === id) {
          const isComp = t.status === 'completed';
          return {
            ...t,
            status: isComp ? 'in_progress' : 'completed',
            completedAt: isComp ? undefined : now
          };
        }
        return t;
      })
    };
    notify();
  },

  deleteTask: (id: string) => {
    currentState = {
      ...currentState,
      tasks: currentState.tasks.filter((t) => t.id !== id)
    };
    notify();
  },

  // Subtask Actions
  addSubtask: (taskId: string, title: string) => {
    const newSubtask = {
      id: `st-${Date.now()}`,
      title: title.trim(),
      completed: false
    };
    currentState = {
      ...currentState,
      tasks: currentState.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: [...t.subtasks, newSubtask] };
        }
        return t;
      })
    };
    notify();
  },

  toggleSubtask: (taskId: string, subtaskId: string) => {
    currentState = {
      ...currentState,
      tasks: currentState.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st))
          };
        }
        return t;
      })
    };
    notify();
  },

  deleteSubtask: (taskId: string, subtaskId: string) => {
    currentState = {
      ...currentState,
      tasks: currentState.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId)
          };
        }
        return t;
      })
    };
    notify();
  },

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...project,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    currentState = { ...currentState, projects: [newProj, ...currentState.projects] };
    notify();
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    currentState = {
      ...currentState,
      projects: currentState.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    };
    notify();
  },

  deleteProject: (id: string) => {
    currentState = {
      ...currentState,
      projects: currentState.projects.filter((p) => p.id !== id)
    };
    notify();
  },

  // Skill Actions
  addSkill: (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: `s-${Date.now()}`
    };
    currentState = { ...currentState, skills: [...currentState.skills, newSkill] };
    notify();
  },

  updateSkill: (id: string, updates: Partial<Skill>) => {
    currentState = {
      ...currentState,
      skills: currentState.skills.map((s) => (s.id === id ? { ...s, ...updates } : s))
    };
    notify();
  },

  // Certification Actions
  addCertification: (cert: Omit<Certification, 'id'>) => {
    const newCert: Certification = {
      ...cert,
      id: `c-${Date.now()}`
    };
    currentState = { ...currentState, certifications: [...currentState.certifications, newCert] };
    notify();
  },

  updateCertification: (id: string, updates: Partial<Certification>) => {
    currentState = {
      ...currentState,
      certifications: currentState.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c))
    };
    notify();
  },

  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `g-${Date.now()}`
    };
    currentState = { ...currentState, goals: [...currentState.goals, newGoal] };
    notify();
  },

  updateGoal: (id: string, updates: Partial<Goal>) => {
    currentState = {
      ...currentState,
      goals: currentState.goals.map((g) => (g.id === id ? { ...g, ...updates } : g))
    };
    notify();
  },

  // Habit Actions
  toggleHabitLog: (habitId: string, dateStr: string) => {
    currentState = {
      ...currentState,
      habits: currentState.habits.map((h) => {
        if (h.id === habitId) {
          const currentLogs = { ...h.logs };
          const isDone = !!currentLogs[dateStr];
          currentLogs[dateStr] = !isDone;

          // recalculate current streak
          let streak = 0;
          const todayDate = new Date();
          for (let i = 0; i < 60; i++) {
            const d = new Date(todayDate);
            d.setDate(d.getDate() - i);
            const dKey = d.toISOString().split('T')[0];
            if (currentLogs[dKey]) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }

          const best = Math.max(h.bestStreak, streak);
          return {
            ...h,
            logs: currentLogs,
            currentStreak: streak,
            bestStreak: best
          };
        }
        return h;
      })
    };
    notify();
  },

  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'logs' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `h-${Date.now()}`,
      currentStreak: 0,
      bestStreak: 0,
      logs: {},
      createdAt: new Date().toISOString()
    };
    currentState = { ...currentState, habits: [...currentState.habits, newHabit] };
    notify();
  },

  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: `n-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    currentState = { ...currentState, notes: [newNote, ...currentState.notes] };
    notify();
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    currentState = {
      ...currentState,
      notes: currentState.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    };
    notify();
  },

  deleteNote: (id: string) => {
    currentState = {
      ...currentState,
      notes: currentState.notes.filter((n) => n.id !== id)
    };
    notify();
  },

  // Resources Action
  addResource: (res: Omit<Resource, 'id' | 'createdAt'>) => {
    const newRes: Resource = {
      ...res,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    currentState = { ...currentState, resources: [newRes, ...currentState.resources] };
    notify();
  },

  updateResource: (id: string, updates: Partial<Resource>) => {
    currentState = {
      ...currentState,
      resources: currentState.resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    };
    notify();
  },

  // Job Action
  addJob: (job: Omit<JobApplication, 'id'>) => {
    const newJob: JobApplication = {
      ...job,
      id: `j-${Date.now()}`
    };
    currentState = { ...currentState, jobs: [newJob, ...currentState.jobs] };
    notify();
  },

  updateJob: (id: string, updates: Partial<JobApplication>) => {
    currentState = {
      ...currentState,
      jobs: currentState.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j))
    };
    notify();
  },

  deleteJob: (id: string) => {
    currentState = {
      ...currentState,
      jobs: currentState.jobs.filter((j) => j.id !== id)
    };
    notify();
  },

  // Resume Actions
  addResume: (resume: Omit<ResumeVersion, 'id'>) => {
    const newResume: ResumeVersion = {
      ...resume,
      id: `res-${Date.now()}`
    };
    currentState = { ...currentState, resumes: [newResume, ...currentState.resumes] };
    notify();
  },

  deleteResume: (id: string) => {
    currentState = {
      ...currentState,
      resumes: currentState.resumes.filter((r) => r.id !== id)
    };
    notify();
  },

  // Achievement Action
  addAchievement: (ach: Omit<Achievement, 'id'>) => {
    const newAch: Achievement = {
      ...ach,
      id: `a-${Date.now()}`
    };
    currentState = { ...currentState, achievements: [newAch, ...currentState.achievements] };
    notify();
  },

  deleteAchievement: (id: string) => {
    currentState = {
      ...currentState,
      achievements: currentState.achievements.filter((a) => a.id !== id)
    };
    notify();
  },

  // Journal Action
  saveJournalEntry: (entry: Omit<JournalEntry, 'id'>) => {
    const existingIndex = currentState.journalEntries.findIndex((e) => e.date === entry.date);
    if (existingIndex >= 0) {
      const updated = [...currentState.journalEntries];
      updated[existingIndex] = { ...updated[existingIndex], ...entry };
      currentState = { ...currentState, journalEntries: updated };
    } else {
      const newEntry: JournalEntry = {
        ...entry,
        id: `je-${Date.now()}`
      };
      currentState = { ...currentState, journalEntries: [newEntry, ...currentState.journalEntries] };
    }
    notify();
  },

  // Weekly Review Action
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => {
    const newReview: WeeklyReview = {
      ...review,
      id: `wr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    currentState = { ...currentState, weeklyReviews: [newReview, ...currentState.weeklyReviews] };
    notify();
  },

  deleteWeeklyReview: (id: string) => {
    currentState = {
      ...currentState,
      weeklyReviews: currentState.weeklyReviews.filter((r) => r.id !== id)
    };
    notify();
  },

  // Calendar Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`
    };
    currentState = { ...currentState, calendarEvents: [...currentState.calendarEvents, newEvent] };
    notify();
  },

  // Documents Actions
  addDocument: (doc: Omit<UserDocument, 'id' | 'uploadDate'>) => {
    const newDoc: UserDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    currentState = { ...currentState, documents: [newDoc, ...currentState.documents] };
    notify();
  },

  deleteDocument: (id: string) => {
    currentState = {
      ...currentState,
      documents: currentState.documents.filter((d) => d.id !== id)
    };
    notify();
  },

  // Notification Action
  markNotificationRead: (id: string) => {
    currentState = {
      ...currentState,
      notifications: currentState.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    };
    notify();
  },

  // Gym & Fitness Actions
  updateGymProfile: (profile: Partial<GymProfile>) => {
    currentState = {
      ...currentState,
      gymProfile: { ...currentState.gymProfile, ...profile }
    };
    notify();
  },

  addBodyMetric: (entry: Omit<BodyMetricEntry, 'id'>) => {
    const newEntry: BodyMetricEntry = {
      ...entry,
      id: `bm-${Date.now()}`
    };
    currentState = {
      ...currentState,
      bodyMetrics: [newEntry, ...currentState.bodyMetrics]
    };
    notify();
  },

  deleteBodyMetric: (id: string) => {
    currentState = {
      ...currentState,
      bodyMetrics: currentState.bodyMetrics.filter((bm) => bm.id !== id)
    };
    notify();
  },

  addWorkoutProgram: (prog: Omit<WorkoutProgram, 'id' | 'createdAt'>) => {
    const newProg: WorkoutProgram = {
      ...prog,
      id: `prog-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    currentState = {
      ...currentState,
      workoutPrograms: [newProg, ...currentState.workoutPrograms]
    };
    notify();
  },

  updateWorkoutProgram: (id: string, updates: Partial<WorkoutProgram>) => {
    currentState = {
      ...currentState,
      workoutPrograms: currentState.workoutPrograms.map((p) => (p.id === id ? { ...p, ...updates } : p))
    };
    notify();
  },

  deleteWorkoutProgram: (id: string) => {
    currentState = {
      ...currentState,
      workoutPrograms: currentState.workoutPrograms.filter((p) => p.id !== id)
    };
    notify();
  },

  addExerciseItem: (ex: Omit<ExerciseItem, 'id' | 'totalSessionsCount'>) => {
    const newEx: ExerciseItem = {
      ...ex,
      id: `ex-${Date.now()}`,
      totalSessionsCount: 0,
      isCustom: true
    };
    currentState = {
      ...currentState,
      exercises: [...currentState.exercises, newEx]
    };
    notify();
  },

  saveWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: `ws-${Date.now()}`
    };

    // Auto-detect PRs & update Exercise last performed date
    const updatedExercises = [...currentState.exercises];
    const updatedPRs = [...currentState.personalRecords];

    newSession.exercises.forEach((ex) => {
      const exIndex = updatedExercises.findIndex((e) => e.id === ex.exerciseId || e.name.toLowerCase() === ex.exerciseName.toLowerCase());
      
      let maxWeightInSession = 0;
      let maxRepsInSession = 0;
      let sessionExVolume = 0;

      ex.sets.forEach((s) => {
        if (s.completed && s.weightKg > 0) {
          if (s.weightKg > maxWeightInSession) {
            maxWeightInSession = s.weightKg;
            maxRepsInSession = s.reps;
          }
          sessionExVolume += s.weightKg * s.reps;
        }
      });

      if (maxWeightInSession > 0) {
        const est1RM = Math.round(maxWeightInSession * (1 + maxRepsInSession / 30));
        
        // Update exercise metadata
        if (exIndex >= 0) {
          const currentBest = updatedExercises[exIndex].personalBestWeightKg || 0;
          updatedExercises[exIndex] = {
            ...updatedExercises[exIndex],
            lastPerformedDate: newSession.date,
            totalSessionsCount: updatedExercises[exIndex].totalSessionsCount + 1,
            personalBestWeightKg: Math.max(currentBest, maxWeightInSession),
            personalBestReps: maxWeightInSession >= currentBest ? maxRepsInSession : updatedExercises[exIndex].personalBestReps
          };
        }

        // Check PRs
        const prIndex = updatedPRs.findIndex((pr) => pr.exerciseId === ex.exerciseId || pr.exerciseName.toLowerCase() === ex.exerciseName.toLowerCase());
        if (prIndex >= 0) {
          const existingPR = updatedPRs[prIndex];
          if (maxWeightInSession > existingPR.heaviestWeightKg || est1RM > existingPR.estimated1RMKg) {
            updatedPRs[prIndex] = {
              ...existingPR,
              heaviestWeightKg: Math.max(existingPR.heaviestWeightKg, maxWeightInSession),
              bestReps: maxWeightInSession >= existingPR.heaviestWeightKg ? maxRepsInSession : existingPR.bestReps,
              bestVolumeKg: Math.max(existingPR.bestVolumeKg, sessionExVolume),
              estimated1RMKg: Math.max(existingPR.estimated1RMKg, est1RM),
              achievedDate: newSession.date
            };
          }
        } else {
          updatedPRs.push({
            id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            heaviestWeightKg: maxWeightInSession,
            bestReps: maxRepsInSession,
            bestVolumeKg: sessionExVolume,
            estimated1RMKg: est1RM,
            achievedDate: newSession.date
          });
        }
      }
    });

    currentState = {
      ...currentState,
      workoutSessions: [newSession, ...currentState.workoutSessions],
      exercises: updatedExercises,
      personalRecords: updatedPRs
    };

    // Auto-create calendar event for workout session
    store.addCalendarEvent({
      title: `💪 ${newSession.dayName} Workout`,
      date: newSession.date,
      type: 'event',
      completed: true
    });

    notify();
  },

  deleteWorkoutSession: (id: string) => {
    currentState = {
      ...currentState,
      workoutSessions: currentState.workoutSessions.filter((ws) => ws.id !== id)
    };
    notify();
  }
};

export function useDashboardStore(): DashboardState {
  const [state, setState] = useState<DashboardState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
