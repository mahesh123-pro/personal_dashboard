import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { store, useDashboardStore } from '../../store/dashboardStore';
import type { Priority, TaskCategory, CertStatus } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'task'
}) => {
  const { projects } = useDashboardStore();
  const [actionType, setActionType] = useState<string>(initialType);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('learning');
  const [taskPriority, setTaskPriority] = useState<Priority>('high');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskEstHours, setTaskEstHours] = useState('2');
  const [taskProjectId, setTaskProjectId] = useState('');

  // Project form
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Technology');
  const [noteContent, setNoteContent] = useState('');

  // Cert form
  const [certName, setCertName] = useState('');
  const [certProvider, setCertProvider] = useState('Amazon Web Services');
  const [certStatus, setCertStatus] = useState<CertStatus>('preparing');
  const [certExamDate, setCertExamDate] = useState('');

  // Resource form
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<'documentation' | 'youtube' | 'course' | 'github'>('documentation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === 'task') {
      if (!taskTitle.trim()) return;
      store.addTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        status: 'not_started',
        dueDate: taskDueDate,
        category: taskCategory,
        projectId: taskProjectId || undefined,
        tags: [taskCategory],
        estimatedHours: parseFloat(taskEstHours) || 1,
        actualHours: 0,
        subtasks: [],
        isRecurring: false
      });
      setTaskTitle('');
    } else if (actionType === 'project') {
      if (!projName.trim()) return;
      store.addProject({
        name: projName.trim(),
        description: projDesc || 'Technical project',
        objective: 'Build and deploy functional system',
        status: 'active',
        health: 'healthy',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        progress: 10,
        techStack: projTech ? projTech.split(',').map((s) => s.trim()) : ['React', 'TypeScript'],
        milestones: [{ id: `m-${Date.now()}`, title: 'Initial Architecture Setup', dueDate: new Date().toISOString().split('T')[0], completed: false }]
      });
      setProjName('');
      setProjDesc('');
    } else if (actionType === 'note') {
      if (!noteTitle.trim()) return;
      store.addNote({
        title: noteTitle.trim(),
        content: noteContent || 'Note details...',
        category: noteCategory,
        tags: [noteCategory],
        isPinned: false,
        isFavorite: false
      });
      setNoteTitle('');
      setNoteContent('');
    } else if (actionType === 'cert') {
      if (!certName.trim()) return;
      store.addCertification({
        name: certName.trim(),
        provider: certProvider,
        category: 'Cloud/Tech',
        status: certStatus,
        examDate: certExamDate || undefined
      });
      setCertName('');
    } else if (actionType === 'resource') {
      if (!resTitle.trim() || !resUrl.trim()) return;
      store.addResource({
        title: resTitle.trim(),
        url: resUrl.trim(),
        type: resType,
        category: 'Learning',
        tags: [resType],
        status: 'to_learn',
        isFavorite: false
      });
      setResTitle('');
      setResUrl('');
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Create Item" maxWidth="lg">
      {/* Type Switcher Tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 border-b border-[var(--border-main)]">
        {[
          { id: 'task', label: '✅ Task' },
          { id: 'project', label: '🚀 Project' },
          { id: 'note', label: '📝 Note' },
          { id: 'cert', label: '📜 Certification' },
          { id: 'resource', label: '🔖 Resource' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActionType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              actionType === t.id
                ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                : 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {actionType === 'task' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Finish AWS S3 practice policy"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Category
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                >
                  <option value="learning">Learning / Skill</option>
                  <option value="project">Project</option>
                  <option value="college">College / Exam</option>
                  <option value="certification">Certification</option>
                  <option value="career">Career</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Est. Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={taskEstHours}
                  onChange={(e) => setTaskEstHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            {projects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Link to Project (Optional)
                </label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {actionType === 'project' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VLSI FIFO Memory Core"
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Key architecture and objectives..."
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                placeholder="Verilog, GTKWave, ModelSim"
                value={projTech}
                onChange={(e) => setProjTech(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </>
        )}

        {actionType === 'note' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Note Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS VPC Subnetting Rules"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Category
              </label>
              <input
                type="text"
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                rows={5}
                placeholder="Write your notes or code snippets here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
          </>
        )}

        {actionType === 'cert' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Certification Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Solutions Architect Associate"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={certProvider}
                  onChange={(e) => setCertProvider(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Status
                </label>
                <select
                  value={certStatus}
                  onChange={(e) => setCertStatus(e.target.value as CertStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                >
                  <option value="planned">Planned</option>
                  <option value="preparing">Preparing</option>
                  <option value="exam_scheduled">Exam Scheduled</option>
                  <option value="passed">Passed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Exam Date (Optional)
              </label>
              <input
                type="date"
                value={certExamDate}
                onChange={(e) => setCertExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </>
        )}

        {actionType === 'resource' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Linux Kernel System Call Docs"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Resource Type
                </label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                >
                  <option value="documentation">Documentation</option>
                  <option value="youtube">YouTube Video</option>
                  <option value="course">Online Course</option>
                  <option value="github">GitHub Repository</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-main)]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};
