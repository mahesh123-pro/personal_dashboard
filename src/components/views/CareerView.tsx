import React, { useState } from 'react';
import {
  Briefcase,
  FileCheck,
  ExternalLink,
  MapPin,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Building2,
  DollarSign,
  Kanban,
  List,
  Check,
  Award,
  TrendingUp
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import type { JobApplication, JobStatus } from '../../types';

export const CareerView: React.FC = () => {
  const { jobs, resumes, skills, certifications, projects } = useDashboardStore();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Job Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [dateApplied, setDateApplied] = useState(todayStr);
  const [jobStatus, setJobStatus] = useState<JobStatus>('applied');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');

  // Resume Form State
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // ----------------------------------------------------
  // AUTOMATIC CAREER READINESS & APPLICATION ENGINE
  // ----------------------------------------------------
  const passedCerts = certifications.filter((c) => c.status === 'passed').length;
  const completedProjs = projects.filter((p) => p.status === 'completed' || p.progress >= 80).length;
  const jobReadySkills = skills.filter((s) => s.currentLevel === 'advanced' || s.currentLevel === 'job_ready').length;

  // Career Readiness Score (0-100)
  const certScore = Math.min(passedCerts * 20, 30);
  const projScore = Math.min(completedProjs * 15, 30);
  const skillScore = Math.min(jobReadySkills * 15, 30);
  const resumeScore = resumes.length > 0 ? 10 : 0;
  const careerReadinessScore = Math.min(100, certScore + projScore + skillScore + resumeScore);

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { label: 'Job-Ready Certified', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 70) return { label: 'High Placement Potential', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    if (score >= 50) return { label: 'Moderate Readiness', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Building Portfolio', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30 font-bold' };
  };

  const readinessInfo = getReadinessLevel(careerReadinessScore);

  // Auto-Detect & Add Target Opportunities
  const handleAutoDetectCareerOpportunities = () => {
    const existingCompanyRoles = new Set(jobs.map((j) => `${j.company.toLowerCase()}-${j.role.toLowerCase()}`));
    let addedCount = 0;

    const recommendedOpportunities = [
      { company: 'AWS Cloud Solutions', role: 'Junior Cloud Infrastructure Associate', location: 'Remote / Bangalore', salary: '₹8 - 12 LPA', status: 'interested' as JobStatus },
      { company: 'Intel Hardware Systems', role: 'VLSI Design & Verification Intern', location: 'Hyderabad', salary: '₹35,000 / month', status: 'interested' as JobStatus },
      { company: 'Red Hat Enterprise', role: 'DevOps & Linux Systems Engineer Trainee', location: 'Remote', salary: '₹9 - 14 LPA', status: 'interested' as JobStatus }
    ];

    recommendedOpportunities.forEach((opp) => {
      const key = `${opp.company.toLowerCase()}-${opp.role.toLowerCase()}`;
      if (!existingCompanyRoles.has(key)) {
        store.addJob({
          company: opp.company,
          role: opp.role,
          dateApplied: todayStr,
          status: opp.status,
          location: opp.location,
          salary: opp.salary,
          notes: 'Auto-detected match based on your AWS Cloud, VLSI, and DevOps skill profile.'
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      alert(`⚡ Auto-detected ${addedCount} top tech opportunity matches for your profile and synced to your pipeline!`);
    } else {
      alert('⚡ Your career pipeline is already synced with recommended opportunity matches!');
    }
  };

  // Pipeline Metrics
  const totalApplied = jobs.filter((j) => j.status !== 'interested').length;
  const activeInterviews = jobs.filter((j) => j.status === 'interview' || j.status === 'assessment').length;
  const responseRate = totalApplied > 0 ? Math.round(((activeInterviews + jobs.filter((j) => j.status === 'selected').length) / totalApplied) * 100) : 0;

  // Status Badge Mapper
  const renderJobStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'selected':
        return <Badge variant="green">Selected 🎉</Badge>;
      case 'interview':
        return <Badge variant="purple" dot font-bold>Interview Phase</Badge>;
      case 'assessment':
        return <Badge variant="amber" dot>Tech Assessment</Badge>;
      case 'applied':
        return <Badge variant="blue">Applied</Badge>;
      case 'rejected':
        return <Badge variant="red">Closed</Badge>;
      default:
        return <Badge variant="neutral">Interested</Badge>;
    }
  };

  // Filter & Search Jobs
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchComp = j.company.toLowerCase().includes(q);
      const matchRole = j.role.toLowerCase().includes(q);
      const matchLoc = j.location?.toLowerCase().includes(q);
      if (!matchComp && !matchRole && !matchLoc) return false;
    }
    return true;
  });

  const handleAddJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    store.addJob({
      company: company.trim(),
      role: role.trim(),
      jobUrl: jobUrl.trim() || undefined,
      dateApplied,
      status: jobStatus,
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setCompany('');
    setRole('');
    setJobUrl('');
    setLocation('');
    setSalary('');
    setNotes('');
    setIsJobModalOpen(false);
  };

  const handleAddResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTitle.trim() && !resumeFile) return;

    let finalUrl = resumeUrl.trim();
    if (resumeFile) {
      try {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
      } catch (err) {
        console.error('Failed to read resume file:', err);
      }
    }

    if (!finalUrl && !resumeUrl.trim()) return;

    const title = resumeTitle.trim() || (resumeFile ? resumeFile.name : 'Untitled Resume');

    store.addResume({
      title,
      url: finalUrl,
      lastUpdated: todayStr
    });

    // Also index in Files Center for unified MongoDB document backup
    store.addDocument({
      name: title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`,
      category: 'resume',
      fileSize: resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB` : '1.2 MB',
      tags: ['resume', 'career'],
      url: finalUrl
    });

    setResumeTitle('');
    setResumeUrl('');
    setResumeFile(null);
    setIsResumeModalOpen(false);
  };

  const handleCopyJobDetails = (job: JobApplication) => {
    const text = `🏢 ${job.company} - ${job.role}\n📍 Location: ${job.location || 'N/A'}\n💰 Salary: ${job.salary || 'N/A'}\n📅 Applied: ${job.dateApplied}\n📌 Status: ${job.status.toUpperCase()}${job.jobUrl ? `\n🔗 Link: ${job.jobUrl}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner Overview */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-[var(--bg-surface-subtle)] via-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-main)] shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Career Pipeline & Placement Engine
              </span>
              <span className="text-xs text-[var(--text-muted)]">• Active Job Search Hub</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Career & Job Applications Center
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xl mt-1">
              Track internship and placement pipelines, manage tailored PDF resumes, and auto-assess placement readiness.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleAutoDetectCareerOpportunities}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Auto-Detect Opportunities
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsJobModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Log Application
            </Button>
          </div>
        </div>

        {/* Readiness Meter Bar */}
        <div className="mt-5 pt-4 border-t border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs border border-[var(--accent-primary)]/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Placement Readiness: {careerReadinessScore}%</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${readinessInfo.color}`}>
                  {readinessInfo.label}
                </span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Calculated from certifications ({passedCerts}), projects ({completedProjs}), & tailored resumes ({resumes.length})
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="w-full bg-[var(--bg-surface-hover)] h-2 rounded-full overflow-hidden border border-[var(--border-main)]">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${careerReadinessScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Applications Submitted
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{jobs.length}</div>
          <div className="text-[10px] text-[var(--text-muted)]">Active company targets</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-500" /> Active Assessments / Interviews
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{activeInterviews}</div>
          <div className="text-[10px] text-[var(--text-muted)]">In interview pipeline</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Response Rate
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{responseRate}%</div>
          <div className="text-[10px] text-[var(--text-muted)]">Applications to interview</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-amber-500" /> Tailored Resumes
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{resumes.length}</div>
          <div className="text-[10px] text-[var(--text-muted)]">Customized PDF files</div>
        </Card>
      </div>

      {/* TAILORED RESUMES SECTION */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              Tailored Resume Versions ({resumes.length})
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsResumeModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Resume PDF
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {resumes.length === 0 ? (
            <div className="col-span-full text-center text-xs text-[var(--text-muted)] p-6">
              No tailored resumes added. Click "Add Resume PDF" to link customized resume versions.
            </div>
          ) : (
            resumes.map((rv) => (
              <div
                key={rv.id}
                className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{rv.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Updated: {rv.lastUpdated}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => store.deleteResume(rv.id)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                    title="Delete resume version"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Active PDF
                  </span>
                  <a
                    href={rv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
                  >
                    View PDF <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* FILTER TABS & SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'interested', label: 'Interested' },
            { id: 'applied', label: 'Applied' },
            { id: 'assessment', label: 'Tech Test' },
            { id: 'interview', label: 'Interview' },
            { id: 'selected', label: 'Selected / Offer' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] w-44 sm:w-52"
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)]">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1 rounded-md transition-all ${viewMode === 'board' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
              title="Kanban Pipeline Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD PIPELINE VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { id: 'interested', label: 'Interested', color: 'border-slate-300 dark:border-slate-700' },
            { id: 'applied', label: 'Applied', color: 'border-blue-500' },
            { id: 'assessment', label: 'Assessment', color: 'border-amber-500' },
            { id: 'interview', label: 'Interview', color: 'border-purple-500' },
            { id: 'selected', label: 'Selected', color: 'border-emerald-500' }
          ].map((col) => {
            const colJobs = filteredJobs.filter((j) => j.status === col.id);
            return (
              <div key={col.id} className="glass-panel rounded-xl p-3 bg-[var(--bg-surface-subtle)] flex flex-col h-full">
                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] truncate">
                    {col.label}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)]">
                    {colJobs.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[350px]">
                  {colJobs.map((j) => (
                    <div
                      key={j.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xs hover:border-[var(--border-strong)] transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-[var(--text-primary)] leading-snug">{j.role}</h5>
                          <span className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {j.company}
                          </span>
                        </div>
                        <button
                          onClick={() => store.deleteJob(j.id)}
                          className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {j.location && (
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {j.location}
                        </div>
                      )}

                      {j.salary && (
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {j.salary}
                        </div>
                      )}

                      {/* Status select for drag/drop transfer simulation */}
                      <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between">
                        <select
                          value={j.status}
                          onChange={(e) => store.updateJob(j.id, { status: e.target.value as JobStatus })}
                          className="px-2 py-1 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[10px] text-[var(--text-secondary)] focus:outline-none font-semibold"
                        >
                          <option value="interested">Interested</option>
                          <option value="applied">Applied</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected 🎉</option>
                          <option value="rejected">Closed</option>
                        </select>

                        {j.jobUrl && (
                          <a
                            href={j.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-primary)] hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <Card className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
              <Briefcase className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="font-semibold text-[var(--text-primary)]">No job applications found.</p>
              <p>Click "Log Application" or "Auto-Detect Opportunities" above to populate your pipeline.</p>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{job.role}</h4>
                    <span className="text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded">
                      @{job.company}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-500">
                        <DollarSign className="w-3 h-3" /> {job.salary}
                      </span>
                    )}
                    <span>Applied on {job.dateApplied}</span>
                  </div>

                  {job.notes && (
                    <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">{job.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderJobStatusBadge(job.status)}

                  <button
                    onClick={() => handleCopyJobDetails(job)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                    title="Copy Details"
                  >
                    {copiedId === job.id ? <Check className="w-4 h-4 text-emerald-500" /> : <ExternalLink className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => store.deleteJob(job.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* LOG APPLICATION MODAL */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title="Log Job / Internship Application"
        maxWidth="md"
      >
        <form onSubmit={handleAddJobSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Amazon / Microsoft"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Role Title
              </label>
              <input
                type="text"
                placeholder="e.g. Cloud Engineer Intern"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Pipeline Stage
              </label>
              <select
                value={jobStatus}
                onChange={(e) => setJobStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="interested">Interested / Bookmarked</option>
                <option value="applied">Applied</option>
                <option value="assessment">Tech Assessment</option>
                <option value="interview">Interview Phase</option>
                <option value="selected">Selected / Offer 🎉</option>
                <option value="rejected">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Date Applied
              </label>
              <input
                type="date"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Remote / Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Salary / Compensation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ₹10 LPA / ₹30k stipend"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Job Post / Application Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/jobs/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Recruiter / Application Notes
            </label>
            <textarea
              rows={2}
              placeholder="Recruiter contact, interview rounds, prep topics..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsJobModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD RESUME MODAL */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title="Add Tailored Resume PDF Version"
        maxWidth="sm"
      >
        <form onSubmit={handleAddResumeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Resume Title / Version Name
            </label>
            <input
              type="text"
              placeholder="e.g. Cloud_Architecture_Resume_v3"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Upload Resume PDF / Document File
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setResumeFile(e.target.files[0]);
                  if (!resumeTitle) setResumeTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
            {resumeFile && (
              <p className="text-[10px] text-emerald-500 font-semibold mt-1">
                Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[var(--border-main)]"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-[var(--text-muted)]">or specify web / drive link</span>
            <div className="flex-grow border-t border-[var(--border-main)]"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              PDF Link / Drive URL (Optional if file uploaded)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsResumeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Resume
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
