import React from 'react';
import { LayoutDashboard, CheckSquare, FolderGit2, BrainCircuit, Menu } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onOpenMenu }) => {
  const mainTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-5 h-5" /> },
    { id: 'learning', label: 'Skills', icon: <BrainCircuit className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border-main)] py-2 px-4 flex items-center justify-around md:hidden shadow-lg">
      {mainTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
              isActive ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span>More</span>
      </button>
    </nav>
  );
};
