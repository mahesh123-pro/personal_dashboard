import React, { useState } from 'react';
import { FileText, Plus, Search, Pin, Trash2 } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { Note } from '../../types';

export const NotesView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { notes } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const categories = Array.from(new Set(notes.map((n) => n.category)));

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !n.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
            Notes & Knowledge Base
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Personal vault of technical documentation, code snippets, and exam summaries.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onOpenQuickAction('note')}
        >
          New Note
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search notes by keyword, topic, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-amber-500" /> Pinned Vault Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedNotes.map((note) => (
              <Card
                key={note.id}
                hoverEffect
                onClick={() => setActiveNote(note)}
                className="cursor-pointer space-y-2 border-amber-200/60 dark:border-amber-900/40"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{note.title}</h4>
                  <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <p className="text-xs text-[var(--text-muted)] line-clamp-3 font-mono leading-relaxed">
                  {note.content.replace(/[#*`]/g, '')}
                </p>
                <div className="flex items-center gap-2 pt-2 text-[10px] text-[var(--text-muted)]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] font-semibold">
                    {note.category}
                  </span>
                  <span>Updated {note.updatedAt}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Notes Grid */}
      <div>
        {pinnedNotes.length > 0 && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            All Notes ({otherNotes.length})
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {otherNotes.map((note) => (
            <Card
              key={note.id}
              hoverEffect
              onClick={() => setActiveNote(note)}
              className="cursor-pointer space-y-2"
            >
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{note.title}</h4>
              <p className="text-xs text-[var(--text-muted)] line-clamp-3 font-mono leading-relaxed">
                {note.content.replace(/[#*`]/g, '')}
              </p>
              <div className="flex items-center justify-between pt-2 text-[10px] text-[var(--text-muted)]">
                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] font-semibold">
                  {note.category}
                </span>
                <span>{note.updatedAt}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Note Detail Reader Modal */}
      {activeNote && (
        <Modal
          isOpen={!!activeNote}
          onClose={() => setActiveNote(null)}
          title={activeNote.title}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Category: <strong>{activeNote.category}</strong></span>
              <span>•</span>
              <span>Updated: {activeNote.updatedAt}</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {activeNote.content}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-main)]">
              <button
                onClick={() => {
                  store.deleteNote(activeNote.id);
                  setActiveNote(null);
                }}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Note
              </button>
              <Button variant="secondary" size="sm" onClick={() => setActiveNote(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
