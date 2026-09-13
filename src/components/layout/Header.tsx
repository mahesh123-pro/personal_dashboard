import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { ProfileMenu } from './ProfileMenu';
import type { ActiveTab } from '../../types';

import { checkMongoHealth } from '../../services/api';

interface HeaderProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onToggleNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  onOpenSearch,
  onOpenQuickAction,
  onToggleNotifications
}) => {
  const { profile, tasks, notifications } = useDashboardStore();
  const { theme, setTheme } = useTheme();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [mongoStatus, setMongoStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    // Poll Mongo status
    checkMongoHealth().then((h) => setMongoStatus(h.dbConnected));
    const mongoInterval = setInterval(() => {
      checkMongoHealth().then((h) => setMongoStatus(h.dbConnected));
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(mongoInterval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed');

  // Dynamic contextual message
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubMessage = () => {
    if (overdueTasks.length > 0) {
      return `Attention required: You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}.`;
    }
    if (todayTasks.length > 0) {
      return `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} scheduled for today.`;
    }
    return "All current tasks are up to date! Focus on active projects.";
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-main)] px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Greeting & Date/Time */}
      <div className="flex items-center gap-3">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--accent-primary)] shadow-sm hidden sm:block"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm hidden sm:flex">
            {profile.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {getGreeting()}, {profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-medium">
              <Sparkles className="w-3 h-3" /> ECE & Cloud OS
            </span>

            {/* MongoDB Live Status Pill */}
            <span className={`hidden md:inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-all ${
              mongoStatus === true
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${mongoStatus === true ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {mongoStatus === true ? 'MongoDB Atlas 🟢' : 'Local Fallback 🟡'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
            <span className="font-medium">{currentDate}</span>
            <span>•</span>
            <span className="font-mono text-[var(--text-secondary)] font-semibold">{currentTime}</span>
            <span className="hidden sm:inline">• {getSubMessage()}</span>
          </p>
        </div>
      </div>

      {/* Right Controls: Search, Quick Add, Notifications, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Search Bar / Ctrl+K Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs"
        >
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="font-medium">Search or command...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-md">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-main)]"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Button */}
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onOpenQuickAction}>
          <span className="hidden sm:inline">Quick Add</span>
        </Button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-main)] transition-colors cursor-pointer"
          title="Notifications & Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--bg-surface)]" />
          )}
        </button>

        {/* Theme Switcher Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)]">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : 'hover:text-[var(--text-primary)]'
            }`}
            title="Light Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : 'hover:text-[var(--text-primary)]'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'system' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : 'hover:text-[var(--text-primary)]'
            }`}
            title="System Theme"
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Badge & More Options Menu */}
        <div className="hidden sm:block">
          <ProfileMenu setActiveTab={setActiveTab} align="top-right" />
        </div>
      </div>
    </header>
  );
};
