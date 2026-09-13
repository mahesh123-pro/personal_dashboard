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

export const initialProfile: UserProfile = {
  name: 'Mahesh',
  role: 'B.Tech Student (ECE & Cloud Computing)',
  college: 'National Institute of Technology',
  degree: 'B.Tech in Electronics & Communication Engineering',
  graduationYear: 2027,
  focusAreas: ['Cloud Infrastructure', 'VLSI & RTL Design', 'DevOps & Linux', 'Systems Programming']
};

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
const inFiveDays = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

export const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Complete AWS S3 bucket security policy practice',
    description: 'Implement bucket policies, lifecycle rules, and cross-region replication setup.',
    priority: 'high',
    status: 'in_progress',
    dueDate: today,
    dueTime: '18:00',
    category: 'learning',
    projectId: 'p-1',
    skillId: 's-1',
    tags: ['AWS', 'Cloud', 'S3'],
    estimatedHours: 2,
    actualHours: 1,
    subtasks: [
      { id: 'st-1', title: 'Create private bucket with KMS encryption', completed: true },
      { id: 'st-2', title: 'Apply bucket policy restricting IAM roles', completed: true },
      { id: 'st-3', title: 'Verify versioning and object lock', completed: false }
    ],
    isRecurring: false,
    createdAt: yesterday
  },
  {
    id: 't-2',
    title: 'Write Verilog testbench for Synchronous FIFO',
    description: 'Simulate full/empty flag assertions and clock domain logic in Icarus Verilog.',
    priority: 'critical',
    status: 'in_progress',
    dueDate: today,
    dueTime: '21:00',
    category: 'project',
    projectId: 'p-2',
    skillId: 's-8',
    tags: ['Verilog', 'VLSI', 'RTL'],
    estimatedHours: 3,
    actualHours: 1.5,
    subtasks: [
      { id: 'st-4', title: 'Define clock generation and reset sequence', completed: true },
      { id: 'st-5', title: 'Write write-enable test sequence', completed: false },
      { id: 'st-6', title: 'Verify read pointer overrun protection', completed: false }
    ],
    isRecurring: false,
    createdAt: yesterday
  },
  {
    id: 't-3',
    title: 'Submit VLSI Design Lab Report #4',
    description: 'CMOS Inverter layout analysis & propagation delay calculation.',
    priority: 'high',
    status: 'not_started',
    dueDate: tomorrow,
    dueTime: '12:00',
    category: 'college',
    tags: ['College', 'Lab', 'VLSI'],
    estimatedHours: 2,
    actualHours: 0,
    subtasks: [
      { id: 'st-7', title: 'Plot VTC curve', completed: false },
      { id: 'st-8', title: 'Calculate noise margins', completed: false }
    ],
    isRecurring: false,
    createdAt: yesterday
  },
  {
    id: 't-4',
    title: 'Revise Linux systemd service configuration',
    description: 'Practice writing custom unit files and managing process lifecycle.',
    priority: 'medium',
    status: 'completed',
    dueDate: yesterday,
    category: 'learning',
    skillId: 's-2',
    tags: ['Linux', 'SysAdmin'],
    estimatedHours: 1.5,
    actualHours: 1.5,
    completedAt: yesterday,
    subtasks: [
      { id: 'st-9', title: 'Write sample daemon script in Python', completed: true },
      { id: 'st-10', title: 'Create /etc/systemd/system unit file', completed: true }
    ],
    isRecurring: false,
    createdAt: yesterday
  },
  {
    id: 't-5',
    title: 'Prepare AWS Certified Solutions Architect Practice Exam #2',
    description: 'Review VPC peering, Transit Gateway, and Route53 DNS routing policies.',
    priority: 'high',
    status: 'not_started',
    dueDate: inThreeDays,
    category: 'certification',
    tags: ['Certification', 'AWS'],
    estimatedHours: 3,
    actualHours: 0,
    subtasks: [],
    isRecurring: false,
    createdAt: today
  }
];

export const initialProjects: Project[] = [
  {
    id: 'p-1',
    name: 'Cloud Infrastructure Portfolio',
    description: 'Automated Multi-Tier AWS Infrastructure deployed using Terraform, Docker, and GitHub Actions.',
    objective: 'Demonstrate production-grade AWS architecture, CI/CD pipeline, and IAM security controls.',
    status: 'active',
    health: 'healthy',
    startDate: '2026-08-01',
    targetCompletionDate: inFiveDays,
    progress: 80,
    techStack: ['AWS', 'Terraform', 'Docker', 'GitHub Actions', 'Linux'],
    repoUrl: 'https://github.com/mahesh/cloud-infrastructure-portfolio',
    deployUrl: 'https://cloud-demo.maheshdev.io',
    milestones: [
      { id: 'pm-1', title: 'VPC & Subnet Architecture Terraform Script', dueDate: '2026-08-15', completed: true },
      { id: 'pm-2', title: 'Dockerized Microservices Containerization', dueDate: '2026-08-25', completed: true },
      { id: 'pm-3', title: 'S3 & CloudFront static assets distribution', dueDate: today, completed: false },
      { id: 'pm-4', title: 'GitHub Actions Automated Deploy Pipeline', dueDate: inFiveDays, completed: false }
    ],
    notes: 'Using AWS Free Tier resources carefully. Clean tear-down scripts configured.',
    problemsEncountered: 'Initial IAM role permission errors on ECS task execution.',
    lessonsLearned: 'Always test least-privilege IAM policies in a sandbox before deploying terraform modules.',
    createdAt: '2026-08-01'
  },
  {
    id: 'p-2',
    name: 'VLSI Synchronous FIFO Memory Core',
    description: 'Synthesizable Verilog implementation of dual-port synchronous FIFO with configurable depth & width.',
    objective: 'Implement clean register-transfer level (RTL) logic and verify timing metrics.',
    status: 'active',
    health: 'healthy',
    startDate: '2026-08-20',
    targetCompletionDate: '2026-09-25',
    progress: 65,
    techStack: ['Verilog', 'SystemVerilog', 'Icarus Verilog', 'GTKWave', 'ModelSim'],
    repoUrl: 'https://github.com/mahesh/vlsi-fifo-core',
    milestones: [
      { id: 'pm-5', title: 'RTL Architecture & Register Pointer Spec', dueDate: '2026-08-28', completed: true },
      { id: 'pm-6', title: 'Verilog Memory Array Module', dueDate: '2026-09-05', completed: true },
      { id: 'pm-7', title: 'Full Testbench & Waveform Verification', dueDate: today, completed: false },
      { id: 'pm-8', title: 'Synthesis & Gate Level Netlist', dueDate: '2026-09-25', completed: false }
    ],
    notes: 'Tested 8-bit width and 16-entry depth configuration.',
    createdAt: '2026-08-20'
  },
  {
    id: 'p-3',
    name: 'Personal Dashboard / Personal OS',
    description: 'All-in-one productivity operating system for tracking study, projects, certs, and tasks.',
    objective: 'Create a clean, human-designed central dashboard for daily B.Tech productivity.',
    status: 'active',
    health: 'healthy',
    startDate: '2026-09-01',
    targetCompletionDate: '2026-09-15',
    progress: 90,
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts'],
    repoUrl: 'https://github.com/mahesh/personal-dashboard',
    milestones: [
      { id: 'pm-9', title: 'UI UX Design System & Layout', dueDate: '2026-09-05', completed: true },
      { id: 'pm-10', title: 'Relational Data Architecture & Offline Store', dueDate: '2026-09-10', completed: true },
      { id: 'pm-11', title: 'Core Productivity Modules', dueDate: today, completed: true }
    ],
    createdAt: '2026-09-01'
  }
];

export const initialSkills: Skill[] = [
  {
    id: 's-1',
    name: 'AWS Cloud Architecture',
    category: 'cloud',
    currentLevel: 'intermediate',
    targetLevel: 'job_ready',
    progress: 75,
    lastStudiedDate: today,
    topics: [
      { id: 'st-1', title: 'IAM Roles, Policies & Multi-Factor Auth', completed: true },
      { id: 'st-2', title: 'VPC, Subnets, Internet Gateways & Security Groups', completed: true },
      { id: 'st-3', title: 'EC2, Auto Scaling & Application Load Balancers', completed: true },
      { id: 'st-4', title: 'S3 Storage Classes, Encryption & Policies', completed: true },
      { id: 'st-5', title: 'RDS & DynamoDB Database Configuration', completed: false },
      { id: 'st-6', title: 'Serverless Architecture with AWS Lambda & API Gateway', completed: false }
    ]
  },
  {
    id: 's-2',
    name: 'Linux Administration & Shell Scripting',
    category: 'devops',
    currentLevel: 'intermediate',
    targetLevel: 'advanced',
    progress: 80,
    lastStudiedDate: yesterday,
    topics: [
      { id: 'st-7', title: 'File System Hierarchy & Permissions (chmod/chown)', completed: true },
      { id: 'st-8', title: 'Process Management (ps, top, kill, systemctl)', completed: true },
      { id: 'st-9', title: 'Bash Automation Scripts & Cron Jobs', completed: true },
      { id: 'st-10', title: 'Networking Tools (ssh, netstat, iptables, ufw)', completed: false }
    ]
  },
  {
    id: 's-8',
    name: 'Verilog & RTL Design',
    category: 'vlsi_embedded',
    currentLevel: 'intermediate',
    targetLevel: 'advanced',
    progress: 70,
    lastStudiedDate: today,
    topics: [
      { id: 'st-11', title: 'Combinational Logic (Mux, Decoder, ALU)', completed: true },
      { id: 'st-12', title: 'Sequential Logic (Flip-Flops, Registers, Counters)', completed: true },
      { id: 'st-13', title: 'Finite State Machines (Moore & Mealy)', completed: true },
      { id: 'st-14', title: 'Testbench Verification & Waveform Analysis', completed: false }
    ]
  },
  {
    id: 's-3',
    name: 'Docker & Containerization',
    category: 'devops',
    currentLevel: 'basic',
    targetLevel: 'intermediate',
    progress: 60,
    lastStudiedDate: '2026-09-08',
    topics: [
      { id: 'st-15', title: 'Dockerfile Directives & Multi-stage Builds', completed: true },
      { id: 'st-16', title: 'Docker Compose Services & Volumes', completed: true },
      { id: 'st-17', title: 'Container Networking & Image Optimization', completed: false }
    ]
  },
  {
    id: 's-4',
    name: 'C / C++ Programming',
    category: 'programming',
    currentLevel: 'intermediate',
    targetLevel: 'advanced',
    progress: 75,
    lastStudiedDate: '2026-09-07',
    topics: [
      { id: 'st-18', title: 'Pointers & Dynamic Memory Allocation', completed: true },
      { id: 'st-19', title: 'Data Structures (Linked Lists, Stacks, Queues)', completed: true },
      { id: 'st-20', title: 'Object Oriented Programming in C++', completed: true },
      { id: 'st-21', title: 'STL Algorithms & Containers', completed: false }
    ]
  }
];

export const initialCertifications: Certification[] = [
  {
    id: 'c-1',
    name: 'AWS Certified Solutions Architect – Associate (SAA-C03)',
    provider: 'Amazon Web Services',
    category: 'Cloud',
    status: 'preparing',
    startDate: '2026-07-15',
    examDate: '2026-10-15',
    notes: 'Aiming for 850+ score. Focusing on resilient architecture and VPC networking.'
  },
  {
    id: 'c-2',
    name: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    provider: 'Microsoft',
    category: 'Cloud',
    status: 'passed',
    startDate: '2026-05-01',
    completionDate: '2026-06-20',
    credentialId: 'AZ-900-MS-883921',
    credentialUrl: 'https://learn.microsoft.com/credentials/AZ-900',
    score: '910/1000'
  },
  {
    id: 'c-3',
    name: 'Linux Foundation Certified System Administrator (LFCS)',
    provider: 'Linux Foundation',
    category: 'SysAdmin',
    status: 'planned',
    notes: 'Targeting Q1 2027 after completing hands-on labs.'
  }
];

export const initialGoals: Goal[] = [
  {
    id: 'g-1',
    name: 'Secure Cloud Engineering Internship for Summer 2027',
    description: 'Build 3 production-grade cloud projects and maintain top certifications.',
    category: 'career',
    timeframe: 'long_term',
    deadline: '2027-01-31',
    progress: 70,
    priority: 'critical',
    status: 'in_progress',
    milestones: [
      { id: 'gm-1', title: 'Complete AWS SAA-C03 Certification', completed: false },
      { id: 'gm-2', title: 'Deploy Cloud Infrastructure Portfolio project', completed: true },
      { id: 'gm-3', title: 'Update Resume with AWS & Docker skills', completed: true },
      { id: 'gm-4', title: 'Apply to 20+ top tier tech companies', completed: false }
    ]
  },
  {
    id: 'g-2',
    name: 'Master Verilog RTL & Hardware Verification',
    description: 'Design and synthesize digital systems to excel in VLSI course and projects.',
    category: 'technical',
    timeframe: 'short_term',
    deadline: '2026-11-30',
    progress: 65,
    priority: 'high',
    status: 'in_progress',
    milestones: [
      { id: 'gm-5', title: 'Complete Synchronous FIFO Memory Core', completed: false },
      { id: 'gm-6', title: 'Score A Grade in VLSI Design Midterm', completed: true }
    ]
  }
];

export const initialHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'AWS / Cloud Practice (1 hr)',
    category: 'Technical',
    targetPerWeek: 5,
    currentStreak: 6,
    bestStreak: 14,
    logs: { [today]: true, [yesterday]: true },
    createdAt: '2026-08-01'
  },
  {
    id: 'h-2',
    name: 'Linux CLI & Scripting',
    category: 'Technical',
    targetPerWeek: 5,
    currentStreak: 4,
    bestStreak: 9,
    logs: { [today]: true, [yesterday]: true },
    createdAt: '2026-08-01'
  },
  {
    id: 'h-3',
    name: 'RTL / Verilog Coding',
    category: 'College & Hardware',
    targetPerWeek: 4,
    currentStreak: 3,
    bestStreak: 7,
    logs: { [today]: true },
    createdAt: '2026-08-01'
  },
  {
    id: 'h-4',
    name: 'Physical Exercise / Workout',
    category: 'Personal',
    targetPerWeek: 4,
    currentStreak: 2,
    bestStreak: 12,
    logs: { [today]: true, [yesterday]: false },
    createdAt: '2026-08-01'
  }
];

export const initialCollegeSubjects: CollegeSubject[] = [
  {
    id: 'cs-1',
    name: 'VLSI Design & CMOS Circuits',
    code: 'EC701',
    faculty: 'Dr. K. R. Sharma',
    credits: 4,
    progress: 75,
    totalClasses: 32,
    attendedClasses: 29,
    assignments: [
      { id: 'ca-1', title: 'CMOS Inverter Noise Margin Analysis', dueDate: tomorrow, completed: false }
    ],
    exams: [
      { id: 'ce-1', title: 'Mid-Semester Exam', examDate: inFiveDays, totalMarks: 50 }
    ],
    notes: 'Focus on Stick Diagrams and Propagation Delay formula.'
  },
  {
    id: 'cs-2',
    name: 'Computer Architecture & Microprocessors',
    code: 'EC702',
    faculty: 'Prof. V. Mehra',
    credits: 4,
    progress: 80,
    totalClasses: 30,
    attendedClasses: 27,
    assignments: [
      { id: 'ca-2', title: 'ARM Assembly Pipelining Hazards', dueDate: '2026-09-20', completed: true }
    ],
    exams: [
      { id: 'ce-2', title: 'Internal Assessment 2', examDate: '2026-09-28', totalMarks: 30 }
    ]
  },
  {
    id: 'cs-3',
    name: 'Digital Communication Systems',
    code: 'EC703',
    faculty: 'Dr. S. Nair',
    credits: 3,
    progress: 60,
    totalClasses: 28,
    attendedClasses: 24,
    assignments: [],
    exams: []
  }
];

export const initialNotes: Note[] = [
  {
    id: 'n-1',
    title: 'AWS VPC Architecture & Subnet CIDR Calculation',
    content: `## VPC Design Best Practices

1. **Subnet Sizing**: Use \`/24\` subnets (251 usable IPs) for application and database tiers.
2. **Public vs Private**:
   - Public subnets must route to Internet Gateway (IGW).
   - Private subnets route outbound traffic via NAT Gateway.
3. **Security Groups**: Stateful firewall applied at EC2 instance level.
4. **NACLs**: Stateless firewall applied at Subnet boundary.`,
    category: 'Technology',
    tags: ['AWS', 'Networking', 'Cloud'],
    relatedProjectId: 'p-1',
    relatedSkillId: 's-1',
    isPinned: true,
    isFavorite: true,
    createdAt: '2026-09-02',
    updatedAt: today
  },
  {
    id: 'n-2',
    title: 'Verilog Non-Blocking (<=) vs Blocking (=) Assignment Rules',
    content: `## Guidelines for Verilog Assignments

- Use **blocking assignments (\`=\`)** for combinational logic (\`always @(*)\`).
- Use **non-blocking assignments (\`<=\`)** for sequential logic (\`always @(posedge clk)\`).
- Do **NOT** mix blocking and non-blocking assignments in the same always block!`,
    category: 'VLSI',
    tags: ['Verilog', 'RTL', 'ECE'],
    relatedProjectId: 'p-2',
    relatedSkillId: 's-8',
    isPinned: true,
    isFavorite: false,
    createdAt: '2026-09-05',
    updatedAt: yesterday
  }
];

export const initialResources: Resource[] = [
  {
    id: 'r-1',
    title: 'AWS Well-Architected Framework Whitepaper',
    url: 'https://aws.amazon.com/architecture/well-architected/',
    type: 'documentation',
    category: 'Cloud',
    description: 'Essential reading for SAA-C03 exam covering the 6 pillars of AWS framework.',
    tags: ['AWS', 'Architecture', 'Whitepaper'],
    status: 'learning',
    isFavorite: true,
    createdAt: '2026-08-15'
  },
  {
    id: 'r-2',
    title: 'ASIC World Verilog Tutorials',
    url: 'http://www.asic-world.com/verilog/veritut.html',
    type: 'website',
    category: 'VLSI',
    description: 'Comprehensive Verilog syntax reference, examples, and testbench guides.',
    tags: ['Verilog', 'VLSI'],
    status: 'completed',
    isFavorite: false,
    createdAt: '2026-08-20'
  }
];

export const initialJobs: JobApplication[] = [
  {
    id: 'j-1',
    company: 'Amazon Web Services (AWS)',
    role: 'Cloud Support Associate Intern',
    jobUrl: 'https://amazon.jobs/en/jobs/2027-cloud-intern',
    dateApplied: '2026-09-01',
    status: 'applied',
    location: 'Bangalore, India',
    salary: 'Industry standard stipend',
    notes: 'Submitted resume with AWS AZ-900 cert and Cloud Infrastructure project.'
  },
  {
    id: 'j-2',
    company: 'Texas Instruments',
    role: 'Digital Design Intern (VLSI)',
    jobUrl: 'https://careers.ti.com/job/vlsi-intern',
    dateApplied: '2026-08-25',
    status: 'assessment',
    location: 'Bangalore, India',
    notes: 'Completed online technical test on Verilog and Digital Electronics.'
  }
];

export const initialResumes: ResumeVersion[] = [
  {
    id: 'rv-1',
    title: 'Mahesh_Resume_Cloud_DevOps_2026.pdf',
    url: 'https://maheshdev.io/resumes/cloud.pdf',
    lastUpdated: today
  },
  {
    id: 'rv-2',
    title: 'Mahesh_Resume_VLSI_Hardware_2026.pdf',
    url: 'https://maheshdev.io/resumes/vlsi.pdf',
    lastUpdated: '2026-08-28'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'a-1',
    title: 'Passed Microsoft Azure Fundamentals (AZ-900)',
    category: 'certification',
    date: '2026-06-20',
    description: 'Scored 910/1000 on Azure Cloud fundamentals exam.',
    credentialUrl: 'https://learn.microsoft.com/credentials/AZ-900'
  },
  {
    id: 'a-2',
    title: 'Deployed Multi-Tier Cloud Architecture Portfolio',
    category: 'project',
    date: '2026-08-25',
    description: 'Successfully deployed automated infrastructure using Terraform & Docker.'
  },
  {
    id: 'a-3',
    title: '1st Runner Up - NIT Hackathon 2026',
    category: 'hackathon',
    date: '2026-04-12',
    description: 'Built an IoT embedded environmental monitoring system using ARM Microcontroller.'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je-1',
    date: today,
    whatILearned: 'Configured AWS S3 bucket policies and learned how explicit DENY takes precedence over ALLOW permissions.',
    whatICompleted: 'Wrote initial testbench skeleton for Synchronous FIFO in Verilog.',
    challenges: 'Faced timing delay mismatches in testbench assertion checks.',
    improvements: 'Use non-blocking assignments strictly in sequential logic blocks.',
    tomorrowPriority: 'Finish FIFO waveform simulation and submit CMOS Inverter Lab report.'
  }
];

export const initialWeeklyReviews: WeeklyReview[] = [
  {
    id: 'wr-1',
    weekEndingDate: '2026-09-06',
    tasksCompletedCount: 14,
    projectsProgressedCount: 3,
    skillsPracticedCount: 4,
    habitsCompletedRate: 85,
    whatWentWell: 'Consistent daily AWS hands-on practice and good progress on the Personal OS dashboard.',
    whatDidntGoWell: 'Delayed CMOS inverter report due to lab timing conflict.',
    nextWeekFocus: 'Complete Synchronous FIFO project testbench and practice 2 AWS SAA practice exams.',
    createdAt: '2026-09-06'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'AWS S3 Security Policy Lab',
    date: today,
    type: 'task',
    priority: 'high',
    completed: false
  },
  {
    id: 'ev-2',
    title: 'VLSI FIFO Testbench Due',
    date: today,
    type: 'project_deadline',
    priority: 'critical',
    completed: false
  },
  {
    id: 'ev-3',
    title: 'VLSI CMOS Inverter Lab Report Submission',
    date: tomorrow,
    type: 'assignment',
    priority: 'high',
    completed: false
  },
  {
    id: 'ev-4',
    title: 'VLSI Design Mid-Semester Exam',
    date: inFiveDays,
    type: 'college_exam',
    priority: 'critical',
    completed: false
  }
];

export const initialDocuments: UserDocument[] = [
  {
    id: 'doc-1',
    name: 'AZ-900_Azure_Certificate.pdf',
    category: 'certificate',
    fileSize: '1.2 MB',
    uploadDate: '2026-06-20',
    tags: ['Azure', 'Certificate']
  },
  {
    id: 'doc-2',
    name: 'Mahesh_Cloud_Resume.pdf',
    category: 'resume',
    fileSize: '240 KB',
    uploadDate: today,
    tags: ['Resume', 'Cloud']
  },
  {
    id: 'doc-3',
    name: 'VLSI_CMOS_Lab_Manual.pdf',
    category: 'college',
    fileSize: '4.5 MB',
    uploadDate: '2026-08-10',
    tags: ['VLSI', 'Lab']
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Task Priority Alert',
    message: 'Verilog testbench for Synchronous FIFO is due today at 21:00.',
    type: 'overdue',
    date: today,
    read: false,
    linkTab: 'tasks'
  },
  {
    id: 'notif-2',
    title: 'Upcoming Exam',
    message: 'VLSI Design Mid-Semester Exam is coming up in 5 days.',
    type: 'college_exam',
    date: today,
    read: false,
    linkTab: 'college'
  }
];

export const initialGymProfile: GymProfile = {
  name: 'Mahesh',
  fitnessGoal: 'Muscle Gain',
  experienceLevel: 'Intermediate (2 Years)',
  currentProgramId: 'prog-ppl',
  trainingDaysPerWeek: 5,
  preferredDurationMins: 60,
  gymName: 'Cult.fit Fitness Club',
  startDate: '2026-01-10',
  currentPhase: 'Hypertrophy Phase 2',
  notes: 'Focusing on progressive overload on Barbell Bench Press and Squat with high protein recovery.'
};

export const initialExercises: ExerciseItem[] = [
  { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', instructions: 'Retract scapula, keep feet flat on ground, touch chest gently and press up.', personalBestWeightKg: 75, personalBestReps: 8, lastPerformedDate: today, totalSessionsCount: 24 },
  { id: 'ex-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', instructions: 'Set bench to 30 degrees, press dumbbells overhead with controlled eccentric.', personalBestWeightKg: 28, personalBestReps: 10, lastPerformedDate: today, totalSessionsCount: 18 },
  { id: 'ex-3', name: 'Overhead Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', instructions: 'Press overhead to lockout, avoid arching lower back.', personalBestWeightKg: 24, personalBestReps: 10, lastPerformedDate: today, totalSessionsCount: 16 },
  { id: 'ex-4', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', instructions: 'Raise dumbbells to side until parallel to ground with slight forward lean.', personalBestWeightKg: 12, personalBestReps: 15, lastPerformedDate: today, totalSessionsCount: 22 },
  { id: 'ex-5', name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', instructions: 'Keep elbows pinned to torso, flare rope out at bottom contraction.', personalBestWeightKg: 30, personalBestReps: 12, lastPerformedDate: today, totalSessionsCount: 20 },
  { id: 'ex-6', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', instructions: 'Pull bar to upper chest, drive elbows down and back.', personalBestWeightKg: 75, personalBestReps: 10, lastPerformedDate: yesterday, totalSessionsCount: 22 },
  { id: 'ex-7', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', instructions: 'Hinge at hips to 45 degrees, row barbell to lower abdomen.', personalBestWeightKg: 65, personalBestReps: 10, lastPerformedDate: yesterday, totalSessionsCount: 19 },
  { id: 'ex-8', name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', instructions: 'Supinate wrist at top, squeeze bicep at peak contraction.', personalBestWeightKg: 16, personalBestReps: 12, lastPerformedDate: yesterday, totalSessionsCount: 25 },
  { id: 'ex-9', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', instructions: 'Break at hips and knees simultaneously, achieve full depth below parallel.', personalBestWeightKg: 110, personalBestReps: 8, lastPerformedDate: '2026-09-09', totalSessionsCount: 21 },
  { id: 'ex-10', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', instructions: 'Push hips back with soft knees, feel stretch in hamstrings.', personalBestWeightKg: 90, personalBestReps: 10, lastPerformedDate: '2026-09-09', totalSessionsCount: 15 }
];

export const initialWorkoutPrograms: WorkoutProgram[] = [
  {
    id: 'prog-ppl',
    name: 'Push Pull Legs (PPL) Hypertrophy',
    description: '5-day split designed for maximum hypertrophy and strength gains.',
    goal: 'Muscle Gain',
    status: 'active',
    startDate: '2026-08-01',
    createdAt: '2026-08-01',
    notes: 'Rest 2-3 minutes on heavy compound lifts, 90s on isolations.',
    days: [
      {
        id: 'day-push',
        dayName: 'Push Day (Chest, Shoulders, Triceps)',
        exercises: [
          { id: 'pe-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', targetMuscle: 'Chest', targetSets: 4, targetReps: '8-10', targetWeightKg: 65, restSeconds: 120, targetRpe: 8 },
          { id: 'pe-2', exerciseId: 'ex-2', exerciseName: 'Incline Dumbbell Press', targetMuscle: 'Chest', targetSets: 3, targetReps: '10-12', targetWeightKg: 24, restSeconds: 90, targetRpe: 8 },
          { id: 'pe-3', exerciseId: 'ex-3', exerciseName: 'Overhead Dumbbell Shoulder Press', targetMuscle: 'Shoulders', targetSets: 3, targetReps: '10-12', targetWeightKg: 20, restSeconds: 90, targetRpe: 8 },
          { id: 'pe-4', exerciseId: 'ex-4', exerciseName: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', targetSets: 4, targetReps: '12-15', targetWeightKg: 10, restSeconds: 60, targetRpe: 9 },
          { id: 'pe-5', exerciseId: 'ex-5', exerciseName: 'Triceps Rope Pushdown', targetMuscle: 'Triceps', targetSets: 3, targetReps: '12-15', targetWeightKg: 25, restSeconds: 60, targetRpe: 9 }
        ]
      },
      {
        id: 'day-pull',
        dayName: 'Pull Day (Back, Rear Delt, Biceps)',
        exercises: [
          { id: 'pe-6', exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', targetMuscle: 'Back', targetSets: 4, targetReps: '8-10', targetWeightKg: 70, restSeconds: 120, targetRpe: 8 },
          { id: 'pe-7', exerciseId: 'ex-7', exerciseName: 'Bent-Over Barbell Row', targetMuscle: 'Back', targetSets: 3, targetReps: '8-10', targetWeightKg: 60, restSeconds: 90, targetRpe: 8 },
          { id: 'pe-8', exerciseId: 'ex-8', exerciseName: 'Dumbbell Bicep Curl', targetMuscle: 'Biceps', targetSets: 4, targetReps: '10-12', targetWeightKg: 14, restSeconds: 60, targetRpe: 9 }
        ]
      },
      {
        id: 'day-legs',
        dayName: 'Legs Day (Quads, Hamstrings, Calves)',
        exercises: [
          { id: 'pe-9', exerciseId: 'ex-9', exerciseName: 'Barbell Back Squat', targetMuscle: 'Legs', targetSets: 4, targetReps: '6-8', targetWeightKg: 100, restSeconds: 150, targetRpe: 9 },
          { id: 'pe-10', exerciseId: 'ex-10', exerciseName: 'Romanian Deadlift (RDL)', targetMuscle: 'Legs', targetSets: 3, targetReps: '10-12', targetWeightKg: 80, restSeconds: 90, targetRpe: 8 }
        ]
      }
    ]
  }
];

export const initialWorkoutSessions: WorkoutSession[] = [
  {
    id: 'ws-1',
    programId: 'prog-ppl',
    dayName: 'Push Day',
    date: today,
    startTime: '07:30',
    durationMins: 58,
    totalVolumeKg: 8420,
    totalSets: 17,
    completedSets: 17,
    notes: 'Felt strong on bench press! Increased weight by 2.5 kg on set 3.',
    exercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, rpe: 7, completed: true },
          { setNumber: 2, weightKg: 62.5, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 65, reps: 8, rpe: 9, completed: true },
          { setNumber: 4, weightKg: 65, reps: 7, rpe: 9.5, completed: true }
        ]
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 24, reps: 12, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 24, reps: 10, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 26, reps: 8, rpe: 9, completed: true }
        ]
      },
      {
        exerciseId: 'ex-3',
        exerciseName: 'Overhead Dumbbell Shoulder Press',
        targetMuscle: 'Shoulders',
        sets: [
          { setNumber: 1, weightKg: 20, reps: 10, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 20, reps: 10, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 22, reps: 8, rpe: 9, completed: true }
        ]
      }
    ]
  },
  {
    id: 'ws-2',
    programId: 'prog-ppl',
    dayName: 'Pull Day',
    date: yesterday,
    startTime: '08:00',
    durationMins: 52,
    totalVolumeKg: 7950,
    totalSets: 15,
    completedSets: 15,
    notes: 'Good back pump. Controlled eccentric phase.',
    exercises: [
      {
        exerciseId: 'ex-6',
        exerciseName: 'Lat Pulldown',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, weightKg: 65, reps: 10, rpe: 7, completed: true },
          { setNumber: 2, weightKg: 70, reps: 10, rpe: 8, completed: true },
          { setNumber: 3, weightKg: 70, reps: 9, rpe: 9, completed: true }
        ]
      }
    ]
  }
];

export const initialBodyMetrics: BodyMetricEntry[] = [
  { id: 'bm-1', date: '2026-08-01', weightKg: 68.0, heightCm: 175, chestCm: 94, waistCm: 78, armsCm: 31, notes: 'Starting metric baseline' },
  { id: 'bm-2', date: '2026-08-15', weightKg: 68.5, heightCm: 175, chestCm: 95, waistCm: 78, armsCm: 31.5, notes: 'Steady progress' },
  { id: 'bm-3', date: '2026-09-01', weightKg: 69.0, heightCm: 175, chestCm: 96, waistCm: 79, armsCm: 32, notes: 'Hypertrophy phase gain' },
  { id: 'bm-4', date: today, weightKg: 69.5, heightCm: 175, chestCm: 96.5, waistCm: 79, armsCm: 32.5, notes: 'Post workout morning weigh-in' }
];

export const initialPersonalRecords: PersonalRecord[] = [
  { id: 'pr-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', heaviestWeightKg: 75, bestReps: 8, bestVolumeKg: 2450, estimated1RMKg: 95, achievedDate: '2026-09-10' },
  { id: 'pr-2', exerciseId: 'ex-9', exerciseName: 'Barbell Back Squat', heaviestWeightKg: 110, bestReps: 8, bestVolumeKg: 3500, estimated1RMKg: 139, achievedDate: '2026-09-09' },
  { id: 'pr-3', exerciseId: 'ex-6', exerciseName: 'Lat Pulldown', heaviestWeightKg: 75, bestReps: 10, bestVolumeKg: 2800, estimated1RMKg: 100, achievedDate: '2026-09-08' }
];
