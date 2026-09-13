import React from 'react';
import { GraduationCap, User } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

export const CollegeView: React.FC = () => {
  const { collegeSubjects } = useDashboardStore();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--accent-primary)]" />
            College & Academics
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Semester subject progress, lab work, faculty details, assignments, and attendance logs.
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collegeSubjects.map((subject) => {
          const attendancePercent = Math.round(
            (subject.attendedClasses / (subject.totalClasses || 1)) * 100
          );

          return (
            <Card key={subject.id} hoverEffect className="space-y-4">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                    {subject.code}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {subject.credits} Credits
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                  {subject.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  <User className="w-3.5 h-3.5" /> Faculty: {subject.faculty}
                </p>
              </div>

              {/* Attendance Tracker */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Attendance Record</span>
                  <span
                    className={`font-bold ${
                      attendancePercent >= 75 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {attendancePercent}% ({subject.attendedClasses}/{subject.totalClasses})
                  </span>
                </div>
                <ProgressBar
                  progress={attendancePercent}
                  size="sm"
                  color={attendancePercent >= 75 ? 'green' : 'amber'}
                />
              </div>

              {/* Assignments */}
              {subject.assignments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Assignments & Lab Reports
                  </h4>
                  <div className="space-y-1.5">
                    {subject.assignments.map((ass) => (
                      <div
                        key={ass.id}
                        className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-[var(--text-primary)] truncate">
                          {ass.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                          Due {ass.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Exam */}
              {subject.exams.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Exam Alert:</span> {subject.exams[0].title} on{' '}
                  <strong>{subject.exams[0].examDate}</strong>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
