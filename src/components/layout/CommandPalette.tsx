import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckSquare,
  FolderGit2,
  BrainCircuit,
  Award,
  Target,
  FileText,
  Bookmark,
  ArrowRight,
  Plus,
  Dumbbell
} from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import type { ActiveTab } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAction: (initialType?: string) => void;
}

interface SearchResultItem {
  id: string;
  type: 'task' | 'project' | 'skill' | 'cert' | 'goal' | 'note' | 'resource' | 'nav' | 'action';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenQuickAction
}) => {
  const { tasks, projects, skills, certifications, notes } = useDashboardStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build Results
  const results: SearchResultItem[] = [];

  // Actions
  if (!query || 'new add task'.includes(query.toLowerCase())) {
    results.push({
      id: 'act-task',
      type: 'action',
      title: 'Create New Task',
      subtitle: 'Add a new item to your task list',
      icon: <Plus className="w-4 h-4 text-blue-500" />,
      action: () => {
        onClose();
        onOpenQuickAction('task');
      }
    });
  }

  if (!query || 'new project'.includes(query.toLowerCase())) {
    results.push({
      id: 'act-proj',
      type: 'action',
      title: 'Create New Project',
      subtitle: 'Start tracking a new technical or college project',
      icon: <Plus className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onClose();
        onOpenQuickAction('project');
      }
    });
  }

  if (!query || 'new note'.includes(query.toLowerCase())) {
    results.push({
      id: 'act-note',
      type: 'action',
      title: 'Create New Note',
      subtitle: 'Write a knowledge base note or code snippet',
      icon: <Plus className="w-4 h-4 text-purple-500" />,
      action: () => {
        onClose();
        onOpenQuickAction('note');
      }
    });
  }

  // Navigation Items
  const navShortcuts: { label: string; tab: ActiveTab; icon: React.ReactNode }[] = [
    { label: 'Go to Dashboard', tab: 'dashboard', icon: <ArrowRight className="w-4 h-4" /> },
    { label: 'Go to Tasks', tab: 'tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Go to Projects', tab: 'projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Go to Skills Tracker', tab: 'learning', icon: <BrainCircuit className="w-4 h-4" /> },
    { label: 'Go to Certifications', tab: 'certifications', icon: <Award className="w-4 h-4" /> },
    { label: 'Go to Goals', tab: 'goals', icon: <Target className="w-4 h-4" /> },
    { label: 'Go to Gym & Fitness', tab: 'gym', icon: <Dumbbell className="w-4 h-4" /> },
    { label: 'Go to Notes & Knowledge', tab: 'notes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Go to Resources & Bookmarks', tab: 'resources', icon: <Bookmark className="w-4 h-4" /> }
  ];

  navShortcuts.forEach((nav) => {
    if (!query || nav.label.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: `nav-${nav.tab}`,
        type: 'nav',
        title: nav.label,
        subtitle: `Jump to ${nav.tab} section`,
        icon: nav.icon,
        action: () => {
          onClose();
          setActiveTab(nav.tab);
        }
      });
    }
  });

  // Query-based entity search
  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    // Search Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: `Task • Priority: ${t.priority} • Due: ${t.dueDate}`,
          icon: <CheckSquare className="w-4 h-4 text-blue-500" />,
          action: () => {
            onClose();
            setActiveTab('tasks');
          }
        });
      }
    });

    // Search Projects
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({
          id: `proj-${p.id}`,
          type: 'project',
          title: p.name,
          subtitle: `Project • ${p.status} • Progress: ${p.progress}%`,
          icon: <FolderGit2 className="w-4 h-4 text-emerald-500" />,
          action: () => {
            onClose();
            setActiveTab('projects');
          }
        });
      }
    });

    // Search Skills
    skills.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        results.push({
          id: `skill-${s.id}`,
          type: 'skill',
          title: s.name,
          subtitle: `Skill • Category: ${s.category} • Level: ${s.currentLevel}`,
          icon: <BrainCircuit className="w-4 h-4 text-purple-500" />,
          action: () => {
            onClose();
            setActiveTab('learning');
          }
        });
      }
    });

    // Search Certifications
    certifications.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q)) {
        results.push({
          id: `cert-${c.id}`,
          type: 'cert',
          title: c.name,
          subtitle: `Cert • ${c.provider} • Status: ${c.status}`,
          icon: <Award className="w-4 h-4 text-amber-500" />,
          action: () => {
            onClose();
            setActiveTab('certifications');
          }
        });
      }
    });

    // Search Notes
    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({
          id: `note-${n.id}`,
          type: 'note',
          title: n.title,
          subtitle: `Note • Category: ${n.category}`,
          icon: <FileText className="w-4 h-4 text-indigo-500" />,
          action: () => {
            onClose();
            setActiveTab('notes');
          }
        });
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-xl glass-panel bg-[var(--bg-surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-main)] flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-main)] bg-[var(--bg-surface-subtle)]">
          <Search className="w-5 h-5 text-[var(--accent-primary)]" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search tasks, projects, notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-strong)] rounded-md bg-[var(--bg-surface)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[60vh] divide-y divide-[var(--border-main)]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No matching tasks, projects, or commands found.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] border border-[var(--accent-border)]'
                      : 'hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs">
                    {item.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-50" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-[var(--bg-surface-subtle)] border-t border-[var(--border-main)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 border rounded-sm bg-slate-100 dark:bg-slate-800">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 border rounded-sm bg-slate-100 dark:bg-slate-800">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 border rounded-sm bg-slate-100 dark:bg-slate-800">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[10px]">Personal OS Search</span>
        </div>
      </div>
    </div>
  );
};
