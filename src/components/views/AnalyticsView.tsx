import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

import { useDashboardStore } from '../../store/dashboardStore';
import { Card } from '../common/Card';

export const AnalyticsView: React.FC = () => {
  const { tasks, projects, skills, habits } = useDashboardStore();

  // Task Category Breakdown
  const categoryData = [
    { name: 'Learning', count: tasks.filter((t) => t.category === 'learning').length },
    { name: 'Project', count: tasks.filter((t) => t.category === 'project').length },
    { name: 'College', count: tasks.filter((t) => t.category === 'college').length },
    { name: 'Certification', count: tasks.filter((t) => t.category === 'certification').length },
    { name: 'Career', count: tasks.filter((t) => t.category === 'career').length }
  ];

  // Project Progress Data
  const projectProgressData = projects.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
    progress: p.progress
  }));

  // Skill Progression Data
  const skillData = skills.map((s) => ({
    name: s.name,
    progress: s.progress
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
            Productivity Analytics
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Visual insights based on real data across tasks, project progress, and skill acquisition.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <Card title="Project Completion Progress (%)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="progress" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Completion Chart */}
        <Card title="Technical Skill Progression (%)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="progress" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Category Distribution */}
        <Card title="Task Distribution by Category">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {categoryData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>
                  {entry.name} ({entry.count})
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Habit Streaks summary */}
        <Card title="Habit Consistency Overview">
          <div className="space-y-4 p-2">
            {habits.map((h) => (
              <div key={h.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{h.name}</span>
                  <span className="text-[var(--text-muted)]">
                    Streak: <strong className="text-amber-500">{h.currentStreak} days</strong> (Best: {h.bestStreak}d)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-surface-hover)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (h.currentStreak / 14) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
