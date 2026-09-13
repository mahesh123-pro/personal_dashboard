import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Code2,
  Trash2
} from 'lucide-react';

import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { HealthBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import type { Project } from '../../types';

export const ProjectsView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { projects } = useDashboardStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[var(--accent-primary)]" />
            Project Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track active technical projects, milestones, tech stack, and deployment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
          >
            <option value="all">All Projects ({projects.length})</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
            <option value="paused">Paused Only</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onOpenQuickAction('project')}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const completedMilestones = project.milestones.filter((m) => m.completed).length;

          return (
            <Card
              key={project.id}
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                    {project.name}
                  </h3>
                  <HealthBadge health={project.health} />
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Overall Progress</span>
                    <span className="font-bold text-[var(--text-primary)]">{project.progress}%</span>
                  </div>
                  <ProgressBar progress={project.progress} size="sm" />
                </div>

                {/* Milestones preview */}
                <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)]">
                  <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex justify-between">
                    <span>Milestones</span>
                    <span>{completedMilestones}/{project.milestones.length}</span>
                  </div>
                  {project.milestones.slice(0, 2).map((m) => (
                    <div key={m.id} className="text-xs flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.completed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <span className={`truncate ${m.completed ? 'line-through text-[var(--text-muted)]' : ''}`}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-secondary)] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                      title="GitHub Repository"
                    >
                      <Code2 className="w-4 h-4" />
                    </a>
                  )}
                  {project.deployUrl && (
                    <a
                      href={project.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface-hover)]"
                      title="Live Deployment"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                  Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          maxWidth="xl"
        >
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Objective
              </h4>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {selectedProject.objective}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Milestones & Deliverables
              </h4>
              <div className="space-y-2">
                {selectedProject.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)]"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => {
                          const updatedMilestones = selectedProject.milestones.map((item) =>
                            item.id === m.id ? { ...item, completed: !item.completed } : item
                          );
                          const compCount = updatedMilestones.filter((x) => x.completed).length;
                          const newProg = Math.round((compCount / updatedMilestones.length) * 100);
                          store.updateProject(selectedProject.id, {
                            milestones: updatedMilestones,
                            progress: newProg
                          });
                          setSelectedProject({
                            ...selectedProject,
                            milestones: updatedMilestones,
                            progress: newProg
                          });
                        }}
                        className="w-4 h-4 rounded text-[var(--accent-primary)]"
                      />
                      <span className={`text-xs ${m.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-medium'}`}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Due {m.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedProject.lessonsLearned && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300">
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Lessons Learned</h5>
                <p className="text-xs leading-relaxed">{selectedProject.lessonsLearned}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-main)]">
              <button
                onClick={() => {
                  store.deleteProject(selectedProject.id);
                  setSelectedProject(null);
                }}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Project
              </button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedProject(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
