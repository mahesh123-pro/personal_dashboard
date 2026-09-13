import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import type { ActiveTab } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { ProjectsView } from './components/views/ProjectsView';
import { LearningView } from './components/views/LearningView';
import { CertificationsView } from './components/views/CertificationsView';
import { GoalsView } from './components/views/GoalsView';
import { HabitsView } from './components/views/HabitsView';
import { CollegeView } from './components/views/CollegeView';
import { NotesView } from './components/views/NotesView';
import { ResourcesView } from './components/views/ResourcesView';
import { CareerView } from './components/views/CareerView';
import { AchievementsView } from './components/views/AchievementsView';
import { JournalView } from './components/views/JournalView';
import { WeeklyReviewView } from './components/views/WeeklyReviewView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { CalendarView } from './components/views/CalendarView';
import { FilesView } from './components/views/FilesView';
import { SettingsView } from './components/views/SettingsView';
import { GymView } from './components/views/GymView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<string>('task');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleOpenQuickAction = (type: string = 'task') => {
    setQuickActionType(type);
    setIsQuickActionOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenQuickAction={handleOpenQuickAction}
          />
        );
      case 'tasks':
        return <TasksView />;
      case 'projects':
        return <ProjectsView onOpenQuickAction={handleOpenQuickAction} />;
      case 'learning':
        return <LearningView onOpenQuickAction={handleOpenQuickAction} />;
      case 'certifications':
        return <CertificationsView onOpenQuickAction={handleOpenQuickAction} />;
      case 'goals':
        return <GoalsView onOpenQuickAction={handleOpenQuickAction} />;
      case 'habits':
        return <HabitsView />;
      case 'gym':
        return <GymView />;
      case 'college':
        return <CollegeView />;
      case 'notes':
        return <NotesView onOpenQuickAction={handleOpenQuickAction} />;
      case 'resources':
        return <ResourcesView onOpenQuickAction={handleOpenQuickAction} />;
      case 'career':
        return <CareerView />;
      case 'achievements':
        return <AchievementsView />;
      case 'journal':
        return <JournalView />;
      case 'weekly_review':
        return <WeeklyReviewView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'calendar':
        return <CalendarView />;
      case 'files':
        return <FilesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenQuickAction={handleOpenQuickAction}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          setActiveTab={setActiveTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAction={() => handleOpenQuickAction('task')}
          onToggleNotifications={() => setIsNotificationOpen(true)}
        />

        {/* View Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setIsSearchOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
        onOpenQuickAction={handleOpenQuickAction}
      />

      {/* Speed Creation Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        initialType={quickActionType}
      />

      {/* Attention & Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
