import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  MoreVertical,
  GraduationCap,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  ChevronRight
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { useTheme } from '../../context/ThemeContext';
import type { ActiveTab } from '../../types';

interface ProfileMenuProps {
  setActiveTab: (tab: ActiveTab) => void;
  collapsed?: boolean;
  align?: 'bottom-left' | 'top-right' | 'bottom-right';
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  setActiveTab,
  collapsed = false,
  align = 'bottom-left'
}) => {
  const { profile } = useDashboardStore();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(store.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `personal_os_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsOpen(false);
  };

  const getPositionClasses = () => {
    switch (align) {
      case 'bottom-left':
        return 'bottom-full left-0 mb-2 w-72';
      case 'top-right':
        return 'top-full right-0 mt-2 w-72';
      case 'bottom-right':
      default:
        return 'bottom-full right-0 mb-2 w-72';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button Trigger */}
      <div
        className={`flex items-center justify-between p-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all cursor-pointer ${
          collapsed ? 'justify-center p-1.5' : 'gap-2.5 px-3'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Avatar with status dot */}
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--border-main)] shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {profile.name.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {profile.name}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">
                {profile.degree.split(' ')[0]} • Class '{profile.graduationYear.toString().slice(2)}
              </div>
            </div>
          )}
        </div>

        {/* More Options Button */}
        {!collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            title="Profile More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${getPositionClasses()} z-50 glass-panel bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-strong)] p-2 space-y-2 animate-fadeIn`}
        >
          {/* Profile Header Summary */}
          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">{profile.name}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                B.Tech Student
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{profile.college}</p>
            <div className="flex flex-wrap gap-1 pt-1.5">
              {profile.focusAreas.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono border border-[var(--border-main)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* More Options Actions */}
          <div className="space-y-0.5 pt-1 text-xs">
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] font-medium transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-500" />
              <span>Edit Profile & Settings</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-[var(--text-muted)]" />
            </button>

            <button
              onClick={() => {
                setActiveTab('college');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] font-medium transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>Academic Status & Subjects</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-[var(--text-muted)]" />
            </button>

            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export Full Data Backup (JSON)</span>
            </button>

            <div className="pt-2 border-t border-[var(--border-main)]">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Quick Theme Switcher
              </div>
              <div className="flex items-center gap-1 p-1 mt-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-main)]">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Moon className="w-3 h-3" /> Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer ${
                    theme === 'system'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Laptop className="w-3 h-3" /> Auto
                </button>
              </div>

              {/* Accent Color Palette Dots */}
              <div className="flex items-center justify-between px-2 pt-2 pb-1">
                {[
                  { id: 'blue', color: 'bg-blue-600' },
                  { id: 'purple', color: 'bg-purple-600' },
                  { id: 'emerald', color: 'bg-emerald-600' },
                  { id: 'rose', color: 'bg-rose-600' },
                  { id: 'amber', color: 'bg-amber-600' },
                  { id: 'cyan', color: 'bg-cyan-600' }
                ].map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setAccent(pal.id as any)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                      accent === pal.id
                        ? 'ring-2 ring-[var(--accent-primary)] ring-offset-1 ring-offset-[var(--bg-surface)] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={`Switch accent to ${pal.id}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${pal.color}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-main)]">
              <button
                onClick={() => {
                  if (confirm('Reset all data to sample initial state?')) {
                    store.resetToDefault();
                    setIsOpen(false);
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
