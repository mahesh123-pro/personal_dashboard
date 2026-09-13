export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type TaskCategory = 'college' | 'project' | 'learning' | 'certification' | 'career' | 'personal';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  dueTime?: string;
  category: TaskCategory;
  projectId?: string;
  skillId?: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  notes?: string;
  subtasks: Subtask[];
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  completedAt?: string;
  createdAt: string;
}

export type ProjectStatus = 'idea' | 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type ProjectHealth = 'healthy' | 'at_risk' | 'stalled';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  objective: string;
  status: ProjectStatus;
  health: ProjectHealth;
  startDate: string;
  targetCompletionDate: string;
  progress: number; // 0-100
  techStack: string[];
  repoUrl?: string;
  deployUrl?: string;
  milestones: ProjectMilestone[];
  notes?: string;
  problemsEncountered?: string;
  lessonsLearned?: string;
  createdAt: string;
}

export type SkillLevel = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'job_ready';
export type SkillCategory = 'cloud' | 'programming' | 'vlsi_embedded' | 'devops' | 'ai_ml' | 'other';

export interface LearningTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number; // 0-100
  topics: LearningTopic[];
  lastStudiedDate?: string;
  notes?: string;
}

export type CertStatus = 'planned' | 'preparing' | 'exam_scheduled' | 'passed' | 'failed' | 'expired';

export interface Certification {
  id: string;
  name: string;
  provider: string; // AWS, Azure, Cisco, etc.
  category: string;
  status: CertStatus;
  startDate?: string;
  examDate?: string;
  completionDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  score?: string;
  expiryDate?: string;
  notes?: string;
}

export type GoalCategory = 'academic' | 'technical' | 'career' | 'projects' | 'certifications' | 'personal' | 'financial';
export type GoalTimeframe = 'short_term' | 'long_term';

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  timeframe: GoalTimeframe;
  deadline: string;
  progress: number; // 0-100
  priority: Priority;
  status: 'not_started' | 'in_progress' | 'completed';
  milestones: GoalMilestone[];
  relatedProjectIds?: string[];
  notes?: string;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  targetPerWeek: number;
  currentStreak: number;
  bestStreak: number;
  logs: Record<string, boolean>; // key YYYY-MM-DD -> boolean
  createdAt: string;
}

export interface CollegeAssignment {
  id: string;
  title: string;
  dueDate: string;
  totalMarks?: number;
  obtainedMarks?: number;
  completed: boolean;
}

export interface CollegeExam {
  id: string;
  title: string;
  examDate: string;
  portion?: string;
  totalMarks?: number;
  obtainedMarks?: number;
}

export interface CollegeSubject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  credits: number;
  progress: number; // 0-100
  totalClasses: number;
  attendedClasses: number;
  assignments: CollegeAssignment[];
  exams: CollegeExam[];
  notes?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relatedProjectId?: string;
  relatedSkillId?: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'website' | 'documentation' | 'youtube' | 'course' | 'github' | 'article' | 'pdf' | 'tool';
export type ResourceStatus = 'to_learn' | 'learning' | 'completed';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  category: string;
  description?: string;
  tags: string[];
  status: ResourceStatus;
  isFavorite: boolean;
  createdAt: string;
}

export type JobStatus = 'interested' | 'applied' | 'assessment' | 'interview' | 'selected' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  dateApplied: string;
  status: JobStatus;
  location?: string;
  salary?: string;
  notes?: string;
}

export interface ResumeVersion {
  id: string;
  title: string;
  url: string;
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: 'certification' | 'project' | 'hackathon' | 'competition' | 'award' | 'github' | 'course';
  date: string;
  description: string;
  credentialUrl?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  whatILearned: string;
  whatICompleted: string;
  challenges: string;
  improvements: string;
  tomorrowPriority: string;
}

export interface WeeklyReview {
  id: string;
  weekEndingDate: string; // YYYY-MM-DD
  tasksCompletedCount: number;
  projectsProgressedCount: number;
  skillsPracticedCount: number;
  habitsCompletedRate: number; // %
  whatWentWell: string;
  whatDidntGoWell: string;
  nextWeekFocus: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'task' | 'college_exam' | 'cert_exam' | 'project_deadline' | 'assignment' | 'goal' | 'event';
  priority?: Priority;
  completed?: boolean;
}

export interface UserDocument {
  id: string;
  name: string;
  category: 'certificate' | 'resume' | 'project_doc' | 'college' | 'note_pdf' | 'other';
  fileSize: string;
  uploadDate: string;
  tags: string[];
  url?: string;
}

export interface UserProfile {
  name: string;
  role: string; // e.g., "B.Tech Student (ECE & Cloud)"
  college: string;
  degree: string;
  graduationYear: number;
  focusAreas: string[];
  avatarUrl?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'deadline' | 'cert_exam' | 'project_warning' | 'college_exam' | 'info';
  date: string;
  read: boolean;
  linkTab?: ActiveTab;
}

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'learning'
  | 'certifications'
  | 'goals'
  | 'habits'
  | 'college'
  | 'notes'
  | 'resources'
  | 'career'
  | 'achievements'
  | 'journal'
  | 'weekly_review'
  | 'analytics'
  | 'calendar'
  | 'files'
  | 'settings'
  | 'gym';

export type FitnessGoal = 'Muscle Gain' | 'Strength' | 'Fat Loss' | 'Endurance' | 'General Fitness' | 'Recomposition' | 'Other';
export type ProgramStatus = 'active' | 'paused' | 'completed' | 'archived';
export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Glutes' | 'Core' | 'Cardio' | 'Full Body' | 'Other';
export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight' | 'Resistance Band' | 'Other';

export interface GymProfile {
  name: string;
  fitnessGoal: FitnessGoal;
  experienceLevel: string;
  currentProgramId?: string;
  trainingDaysPerWeek: number;
  preferredDurationMins: number;
  gymName?: string;
  startDate: string;
  currentPhase: string;
  notes?: string;
}

export interface BodyMetricEntry {
  id: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  shouldersCm?: number;
  customMeasurementName?: string;
  customMeasurementVal?: number;
  notes?: string;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  targetSets: number;
  targetReps: string;
  targetWeightKg?: number;
  restSeconds: number;
  tempo?: string;
  targetRpe?: number;
  notes?: string;
}

export interface ProgramDay {
  id: string;
  dayName: string;
  exercises: ProgramExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  goal: FitnessGoal;
  status: ProgramStatus;
  startDate: string;
  endDate?: string;
  days: ProgramDay[];
  notes?: string;
  createdAt: string;
}

export interface GymSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  sets: GymSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  programId?: string;
  dayName: string;
  date: string;
  startTime: string;
  durationMins: number;
  exercises: WorkoutSessionExercise[];
  totalVolumeKg: number;
  totalSets: number;
  completedSets: number;
  notes?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  instructions?: string;
  personalBestWeightKg?: number;
  personalBestReps?: number;
  lastPerformedDate?: string;
  totalSessionsCount: number;
  isCustom?: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  heaviestWeightKg: number;
  bestReps: number;
  bestVolumeKg: number;
  estimated1RMKg: number;
  achievedDate: string;
}
