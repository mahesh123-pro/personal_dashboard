import React, { useState } from 'react';
import { BrainCircuit, Plus, CheckCircle2, Circle } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LevelBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import type { SkillLevel } from '../../types';

export const LearningView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { skills } = useDashboardStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    return true;
  });

  const levelOptions: SkillLevel[] = ['beginner', 'basic', 'intermediate', 'advanced', 'job_ready'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[var(--accent-primary)]" />
            Learning & Skills Tracker
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Systematic progression from Beginner to Job-Ready across Cloud, VLSI, DevOps, and CS Core.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="cloud">Cloud Architecture</option>
            <option value="devops">DevOps & Linux</option>
            <option value="vlsi_embedded">VLSI & Hardware</option>
            <option value="programming">Programming Languages</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onOpenQuickAction('task')}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {/* Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSkills.map((skill) => {
          const completedTopics = skill.topics.filter((t) => t.completed).length;

          return (
            <Card key={skill.id} className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{skill.name}</h3>
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                      {skill.category.replace('_', ' ')}
                    </span>
                  </div>
                  <LevelBadge level={skill.currentLevel} />
                </div>

                {/* Level Adjuster */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[var(--text-muted)]">Current Level:</span>
                  <select
                    value={skill.currentLevel}
                    onChange={(e) =>
                      store.updateSkill(skill.id, { currentLevel: e.target.value as SkillLevel })
                    }
                    className="px-2 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    {levelOptions.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1">
                  <span>Topic Completion Rate</span>
                  <span className="font-bold text-[var(--text-primary)]">{skill.progress}%</span>
                </div>
                <ProgressBar progress={skill.progress} color="purple" size="sm" />
              </div>

              {/* Topics checklist */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] flex justify-between">
                  <span>Learning Syllabus & Topics</span>
                  <span className="text-[var(--text-muted)]">{completedTopics}/{skill.topics.length}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {skill.topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => {
                        const updatedTopics = skill.topics.map((t) =>
                          t.id === topic.id ? { ...t, completed: !t.completed } : t
                        );
                        const cCount = updatedTopics.filter((x) => x.completed).length;
                        const newProg = Math.round((cCount / updatedTopics.length) * 100);
                        store.updateSkill(skill.id, {
                          topics: updatedTopics,
                          progress: newProg,
                          lastStudiedDate: new Date().toISOString().split('T')[0]
                        });
                      }}
                      className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      )}
                      <span className={topic.completed ? 'line-through text-[var(--text-muted)]' : ''}>
                        {topic.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {skill.lastStudiedDate && (
                <div className="text-[11px] text-[var(--text-muted)] text-right">
                  Last studied: {skill.lastStudiedDate}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
