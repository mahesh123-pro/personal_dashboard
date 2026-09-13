import React, { useState } from 'react';
import { FolderArchive, Plus, FileText, Trash2, Search } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const FilesView: React.FC = () => {
  const { documents } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Doc Form
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<'certificate' | 'resume' | 'project_doc' | 'college'>('certificate');

  const filteredDocs = documents.filter((doc) => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    store.addDocument({
      name: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
      category: docCategory,
      fileSize: '1.4 MB',
      tags: [docCategory]
    });

    setDocName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-[var(--accent-primary)]" />
            Document & File Center
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Indexed vault for certificates, resume PDFs, lab manuals, and project documentation.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add File Index
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents by filename or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="certificate">Certificates</option>
          <option value="resume">Resumes</option>
          <option value="college">College Documents</option>
          <option value="project_doc">Project Docs</option>
        </select>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} hoverEffect className="flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{doc.name}</h4>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {doc.fileSize} • Uploaded {doc.uploadDate}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] text-[var(--text-muted)]">
                {doc.category}
              </span>
              <button
                onClick={() => store.deleteDocument(doc.id)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Index New Document">
        <form onSubmit={handleAddDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Document Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS_Solutions_Architect_Certificate.pdf"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Category
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]"
            >
              <option value="certificate">Certificate</option>
              <option value="resume">Resume</option>
              <option value="college">College Document</option>
              <option value="project_doc">Project Doc</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-main)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
