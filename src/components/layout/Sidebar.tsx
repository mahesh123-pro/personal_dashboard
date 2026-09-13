import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  BrainCircuit,
  Award,
  Target,
  Zap,
  GraduationCap,
  FileText,
  Bookmark,
  Briefcase,
  Trophy,
  BookOpen,
  RotateCcw,
  BarChart3,
  Calendar as CalendarIcon,
  FolderArchive,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Dumbbell
} from 'lucide-react';

import type { ActiveTab } from '../../types';
import { useDashboardStore } from '../../store/dashboardStore';
import { ProfileMenu } from './ProfileMenu';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavGroup {
  label?: string;
  items: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { tasks, projects, certifications } = useDashboardStore();

  const overdueCount = tasks.filter((t) => t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0]).length;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const prepCertsCount = certifications.filter((c) => c.status === 'preparing' || c.status === 'exam_scheduled').length;

  const navGroups: NavGroup[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, badgeCount: overdueCount > 0 ? overdueCount : undefined },
        { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-5 h-5" />, badgeCount: activeProjectsCount }
      ]
    },
    {
      label: 'Growth & Learning',
      items: [
        { id: 'learning', label: 'Skills & Topics', icon: <BrainCircuit className="w-5 h-5" /> },
        { id: 'certifications', label: 'Certifications', icon: <Award className="w-5 h-5" />, badgeCount: prepCertsCount },
        { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
        { id: 'habits', label: 'Habits Tracker', icon: <Zap className="w-5 h-5" /> },
        { id: 'gym', label: 'Gym & Fitness', icon: <Dumbbell className="w-5 h-5" /> },
        { id: 'college', label: 'College & Study', icon: <GraduationCap className="w-5 h-5" /> }
      ]
    },
    {
      label: 'Knowledge & Vault',
      items: [
        { id: 'notes', label: 'Notes & Vault', icon: <FileText className="w-5 h-5" /> },
        { id: 'resources', label: 'Resources', icon: <Bookmark className="w-5 h-5" /> },
        { id: 'career', label: 'Career Prep', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> }
      ]
    },
    {
      label: 'Reviews & Tools',
      items: [
        { id: 'journal', label: 'Daily Journal', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'weekly_review', label: 'Weekly Review', icon: <RotateCcw className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
        { id: 'files', label: 'Files Center', icon: <FolderArchive className="w-5 h-5" /> }
      ]
    },
    {
      items: [
        { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[var(--bg-surface)] border-r border-[var(--border-main)] transition-all duration-300 flex flex-col justify-between hidden md:flex ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-main)]">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--accent-primary)] text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--text-primary)] tracking-tight block leading-none">
                  Personal OS
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">B.Tech Edition v1.0</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto p-2 rounded-xl bg-[var(--accent-primary)] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="py-3 px-2 overflow-y-auto max-h-[calc(100vh-140px)] space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.label && !collapsed && (
                <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badgeCount !== undefined && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer Summary with More Options */}
      <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-surface-subtle)]">
        <ProfileMenu setActiveTab={setActiveTab} collapsed={collapsed} align="bottom-left" />
      </div>
    </aside>
  );
};
