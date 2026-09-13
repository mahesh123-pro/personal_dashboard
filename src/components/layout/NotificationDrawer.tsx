import React from 'react';
import { X, Bell, AlertTriangle, Calendar, Info } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import type { ActiveTab } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const { notifications } = useDashboardStore();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'college_exam':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'cert_exam':
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-sm h-full bg-[var(--bg-surface)] border-l border-[var(--border-main)] shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Notifications & Alerts
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 overflow-y-auto max-h-[calc(100vh-120px)] space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No new notifications. Everything is on track!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    store.markNotificationRead(n.id);
                    if (n.linkTab) {
                      setActiveTab(n.linkTab);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.read
                      ? 'bg-[var(--bg-surface-subtle)] border-[var(--border-main)] opacity-75'
                      : 'bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-surface-hover)] mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)]">{n.date}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-surface-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{notifications.filter((n) => !n.read).length} unread alerts</span>
          <button
            onClick={() => notifications.forEach((n) => store.markNotificationRead(n.id))}
            className="text-[var(--accent-primary)] hover:underline font-medium cursor-pointer"
          >
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
};
