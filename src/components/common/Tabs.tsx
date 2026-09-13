import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = ''
}: TabsProps<T>) {
  return (
    <div className={`flex items-center gap-1 border-b border-[var(--border-main)] overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold'
                    : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
