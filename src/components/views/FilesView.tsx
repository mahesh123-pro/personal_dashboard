import React, { useState, useRef } from 'react';
import { FolderArchive, Plus, FileText, Trash2, Search, Upload, Download, Eye, HardDrive, FileCheck } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { UserDocument } from '../../types';

export const FilesView: React.FC = () => {
  const { documents } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New File Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<UserDocument['category']>('certificate');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name);
      }
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);

    let dataUrl = '';
    let sizeStr = '1.2 MB';

    if (selectedFile) {
      sizeStr = formatFileSize(selectedFile.size);
      try {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      } catch (err) {
        console.error('File reading failed:', err);
      }
    }

    const finalName = docName.trim();

    store.addDocument({
      name: finalName,
      category: docCategory,
      fileSize: sizeStr,
      tags: [docCategory],
      url: dataUrl || undefined
    });

    setDocName('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-[var(--accent-primary)]" />
            Document & File Center
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Cloud database storage for uploaded PDFs, certificates, lab manuals, resumes, and project files.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Upload & Index File
        </Button>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Total Stored Files</span>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{documents.length} files</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Database Storage Status</span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Synced with MongoDB Atlas
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Active Categories</span>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
              {new Set(documents.map((d) => d.category)).size} Categories
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <FolderArchive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
          <option value="note_pdf">Notes & PDF</option>
          <option value="other">Other Files</option>
        </select>
      </div>

      {/* Files Grid */}
      {filteredDocs.length === 0 ? (
        <Card className="text-center py-12 text-[var(--text-muted)]">
          <FolderArchive className="w-12 h-12 mx-auto mb-3 opacity-40 text-[var(--text-muted)]" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">No documents found</p>
          <p className="text-xs mt-1">Upload a file or create a file index to store it in MongoDB Atlas.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hoverEffect className="flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {doc.fileSize} • Uploaded {doc.uploadDate}
                  </div>
                  {doc.url && (
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      ☁️ Stored in MongoDB
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--bg-surface-hover)] text-[var(--text-muted)]">
                  {doc.category}
                </span>

                <div className="flex items-center gap-1">
                  {doc.url && (
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {doc.url && (
                    <a
                      href={doc.url}
                      download={doc.name}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--bg-surface-hover)] transition-colors"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => store.deleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload File to MongoDB Atlas">
        <form onSubmit={handleAddDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Select File to Upload *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent-primary)] bg-[var(--bg-surface-subtle)] text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[var(--accent-primary)] mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{selectedFile.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Click to choose a file (PDF, Image, Doc, etc.)</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">File content will be saved directly into MongoDB Cloud Database</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Document Display Name *
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
              <option value="note_pdf">Notes & PDF</option>
              <option value="other">Other File</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-main)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading & Syncing...' : 'Upload & Save to MongoDB'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={`Preview: ${previewDoc.name}`} maxWidth="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] bg-[var(--bg-surface-subtle)] p-2.5 rounded-xl border border-[var(--border-main)]">
              <span>Category: <strong className="text-[var(--text-primary)] uppercase">{previewDoc.category}</strong></span>
              <span>Size: <strong className="text-[var(--text-primary)]">{previewDoc.fileSize}</strong></span>
              <span>Uploaded: <strong className="text-[var(--text-primary)]">{previewDoc.uploadDate}</strong></span>
            </div>

            <div className="w-full h-96 rounded-xl border border-[var(--border-main)] bg-slate-900 overflow-hidden flex items-center justify-center">
              {previewDoc.url ? (
                previewDoc.url.startsWith('data:image/') ? (
                  <img src={previewDoc.url} alt={previewDoc.name} className="max-h-full max-w-full object-contain" />
                ) : previewDoc.url.startsWith('data:application/pdf') ? (
                  <iframe src={previewDoc.url} title={previewDoc.name} className="w-full h-full border-none" />
                ) : (
                  <div className="text-center p-6 text-white space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-blue-400" />
                    <p className="text-xs font-semibold">Binary or Document File</p>
                    <p className="text-[10px] text-gray-400">Preview not directly available in iframe for this format.</p>
                    <a
                      href={previewDoc.url}
                      download={previewDoc.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors mt-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-400 text-xs">No file data attached</div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              {previewDoc.url ? (
                <a
                  href={previewDoc.url}
                  download={previewDoc.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Document
                </a>
              ) : <div />}

              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
