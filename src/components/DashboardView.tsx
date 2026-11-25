import React from 'react';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  AnnouncementItem,
  AttendanceRecord,
  CourseItem,
  MarkEntry,
  PortalTab,
  StudentProfile,
} from '../types';
import {
  computeAttendanceStats,
  computeCourseSummaries,
  computeOverallGpa,
} from '../utils/academics';

interface DashboardViewProps {
  student: StudentProfile;
  attendance: AttendanceRecord[];
  marks: MarkEntry[];
  courses: CourseItem[];
  announcements: AnnouncementItem[];
  onNavigate: (tab: PortalTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  attendance,
  marks,
  courses,
  announcements,
  onNavigate,
}) => {
  const fallMarks = marks.filter((m) => m.term === 'Fall 2026');
  const activeMarks = fallMarks.length > 0 ? fallMarks : marks;
  const summaries = computeCourseSummaries(activeMarks, courses);
  const gpa = computeOverallGpa(summaries);
  const attStats = computeAttendanceStats(attendance);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const recentMarks = marks.slice(0, 5);
  const recentAttendance = attendance.slice(0, 5);

  const renderStatusLabel = (status: AttendanceRecord['status']) => {
    if (status === 'Present') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Present
        </span>
      );
    }
    if (status === 'Late') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Late
        </span>
      );
    }
    if (status === 'Excused') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          Excused
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        Absent
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">
            {student.gradeLevel} · Section {student.section} · {student.studentCode}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {student.preferredName || student.fullName.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Attendance
          </button>
          <button
            type="button"
            onClick={() => onNavigate('marks')}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Grade Ledger
          </button>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <section aria-label="Academic summary metrics" className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-6">
          <p className="text-xs font-medium text-slate-500 mb-2">Cumulative Term GPA</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {gpa > 0 ? gpa.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">/ 4.00</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Based on {summaries.length} active subjects
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-medium text-slate-500 mb-2">Attendance Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {attStats.ratePct.toFixed(1)}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {attStats.ratePct >= 90 ? 'Nominal' : 'Monitor'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 tabular-nums">
            {attStats.present} present · {attStats.late} late · {attStats.absent} absent
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-medium text-slate-500 mb-2">Enrolled Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {totalCredits.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">credits</span>
          </div>
          <p className="mt-2 text-xs text-slate-600 tabular-nums">
            {courses.length} scheduled courses · Fall 2026
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-medium text-slate-500 mb-2">Academic Standing</p>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1E3A5F] shrink-0" />
            <span className="text-xl font-semibold text-slate-900">
              {student.academicStanding}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Advisor: {student.advisorName}
          </p>
        </div>
      </section>

      {/* Main Split: Subject Performance + Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Subject Grade Standing</h2>
              <p className="text-xs text-slate-500 mt-0.5">Weighted percentage across Fall 2026 coursework</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('marks')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer whitespace-nowrap"
            >
              Full transcript
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summaries.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No graded assessments recorded for this term yet.
            </div>
          ) : (
            <div className="space-y-4">
              {summaries.map((item) => {
                const widthPct = Math.min(100, Math.max(0, item.weightedPct));
                return (
                  <div key={item.courseCode} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-medium text-slate-500 shrink-0">
                          {item.courseCode}
                        </span>
                        <span className="font-medium text-slate-900 truncate">
                          {item.courseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-xs">
                        <span className="text-slate-600">{item.weightedPct.toFixed(1)}%</span>
                        <span className="font-semibold text-[#1E3A5F] w-6 text-right">
                          {item.letterGrade}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E3A5F] rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Attendance Consistency & Recent Check-ins */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Recent Attendance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest 5 recorded class periods</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer whitespace-nowrap"
              >
                All records
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentAttendance.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No attendance logs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAttendance.map((rec) => (
                  <div key={rec.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {rec.courseName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                        {rec.date} · {rec.period}
                      </p>
                    </div>
                    <div className="shrink-0">{renderStatusLabel(rec.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Distribution Summary Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium text-slate-700">Session Breakdown</span>
              <span className="font-mono tabular-nums">{attStats.total} sessions</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {attStats.total > 0 && (
                <>
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${(attStats.present / attStats.total) * 100}%` }}
                    title={`Present: ${attStats.present}`}
                  />
                  <div
                    className="bg-sky-600 h-full"
                    style={{ width: `${(attStats.excused / attStats.total) * 100}%` }}
                    title={`Excused: ${attStats.excused}`}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${(attStats.late / attStats.total) * 100}%` }}
                    title={`Late: ${attStats.late}`}
                  />
                  <div
                    className="bg-red-600 h-full"
                    style={{ width: `${(attStats.absent / attStats.total) * 100}%` }}
                    title={`Absent: ${attStats.absent}`}
                  />
                </>
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-emerald-600" />
                Present ({attStats.present})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-sky-600" />
                Excused ({attStats.excused})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-amber-500" />
                Late ({attStats.late})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-red-600" />
                Absent ({attStats.absent})
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Recent Graded Marks + Academic Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#1E3A5F]" />
              <h2 className="text-base font-semibold text-slate-900">Recent Graded Assessments</h2>
            </div>
            <span className="text-xs text-slate-500">Latest 5 entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/60">
                  <th className="py-3 px-6">Assessment</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentMarks.map((mark) => {
                  const pct = mark.maxScore > 0 ? (mark.score / mark.maxScore) * 100 : 0;
                  return (
                    <tr key={mark.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-6">
                        <p className="font-medium text-slate-900">{mark.assessmentTitle}</p>
                        <p className="text-xs text-slate-500">{mark.assessmentType}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {mark.courseCode}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {mark.gradedDate}
                      </td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          {mark.score}/{mark.maxScore}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({pct.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <CalendarCheck2 className="w-4 h-4 text-[#1E3A5F]" />
            <h2 className="text-base font-semibold text-slate-900">Academic Notices</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {announcements.map((item) => (
              <article key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-medium text-[#1E3A5F]">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.dateLabel}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
