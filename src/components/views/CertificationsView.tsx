import React from 'react';
import { Award, Plus, Clock, ExternalLink } from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const CertificationsView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { certifications } = useDashboardStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="green" dot>Passed & Certified</Badge>;
      case 'exam_scheduled':
        return <Badge variant="amber" dot font-bold>Exam Scheduled</Badge>;
      case 'preparing':
        return <Badge variant="blue" dot>Preparing</Badge>;
      case 'planned':
      default:
        return <Badge variant="neutral">Planned</Badge>;
    }
  };

  const calculateDaysLeft = (examDateStr?: string) => {
    if (!examDateStr) return null;
    const diff = new Date(examDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const plannedCount = certifications.filter((c) => c.status === 'planned').length;
  const prepCount = certifications.filter((c) => c.status === 'preparing' || c.status === 'exam_scheduled').length;
  const passedCount = certifications.filter((c) => c.status === 'passed').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-primary)]" />
            Certification Tracker
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track industry certifications across AWS, Azure, Linux, Cisco, and GitHub.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onOpenQuickAction('cert')}
        >
          Add Certification
        </Button>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">In Preparation</span>
          <div className="text-2xl font-bold text-blue-950 dark:text-blue-100 mt-1">{prepCount}</div>
        </Card>
        <Card padding="sm" className="bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Passed & Active</span>
          <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 mt-1">{passedCount}</div>
        </Card>
        <Card padding="sm" className="bg-slate-50/40 dark:bg-slate-950/20">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Planned</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{plannedCount}</div>
        </Card>
      </div>

      {/* Certifications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certifications.map((cert) => {
          const daysLeft = calculateDaysLeft(cert.examDate);

          return (
            <Card key={cert.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                      {cert.name}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      {cert.provider} • {cert.category}
                    </span>
                  </div>
                  {getStatusBadge(cert.status)}
                </div>

                {/* Exam Countdown Card */}
                {cert.examDate && cert.status !== 'passed' && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between my-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Exam Scheduled: {cert.examDate}
                      </span>
                    </div>
                    {daysLeft !== null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Exam Today!'}
                      </span>
                    )}
                  </div>
                )}

                {cert.notes && (
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {cert.notes}
                  </p>
                )}

                {/* Completed Details */}
                {cert.status === 'passed' && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                    {cert.score && <div>Score Achieved: <strong>{cert.score}</strong></div>}
                    {cert.credentialId && <div>Credential ID: <span className="font-mono">{cert.credentialId}</span></div>}
                    {cert.completionDate && <div>Passed Date: {cert.completionDate}</div>}
                  </div>
                )}
              </div>

              {/* Footer Links */}
              <div className="pt-3 mt-4 border-t border-[var(--border-main)] flex items-center justify-between">
                <select
                  value={cert.status}
                  onChange={(e) =>
                    store.updateCertification(cert.id, { status: e.target.value as any })
                  }
                  className="px-2 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)]"
                >
                  <option value="planned">Planned</option>
                  <option value="preparing">Preparing</option>
                  <option value="exam_scheduled">Exam Scheduled</option>
                  <option value="passed">Passed</option>
                </select>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
                  >
                    View Credential <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
