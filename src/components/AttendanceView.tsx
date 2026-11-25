import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquarePlus,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  adminCreateAttendance,
  adminDeleteAttendance,
  adminUpdateAttendanceStatus,
  updateAttendanceRemarks,
} from '../services/schoolService';
import { AttendanceRecord, AttendanceStatus, CourseItem, StudentProfile } from '../types';
import { computeAttendanceStats } from '../utils/academics';

interface AttendanceViewProps {
  student: StudentProfile;
  records: AttendanceRecord[];
  courses: CourseItem[];
  isAdmin: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  student,
  records,
  courses,
  isAdmin,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus>('All');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Inline note editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRemarks, setDraftRemarks] = useState('');
  const [draftStatus, setDraftStatus] = useState<AttendanceStatus>('Present');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Admin add-record state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.courseCode || 'MATH-401');
  const [newDate, setNewDate] = useState('2026-11-25');
  const [newPeriod, setNewPeriod] = useState('Period 1');
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('Present');
  const [newRemarks, setNewRemarks] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const stats = useMemo(() => computeAttendanceStats(records), [records]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return records.filter((rec) => {
      if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
      if (courseFilter !== 'ALL' && rec.courseCode !== courseFilter) return false;
      if (q) {
        const hay = `${rec.courseName} ${rec.courseCode} ${rec.date} ${rec.remarks || ''} ${rec.recordedBy}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, statusFilter, courseFilter, searchTerm]);

  const startEditing = (rec: AttendanceRecord) => {
    setEditingId(rec.id);
    setDraftRemarks(rec.remarks || '');
    setDraftStatus(rec.status);
  };

  const handleSaveEdit = async (rec: AttendanceRecord) => {
    setSavingId(rec.id);
    setActionFeedback(null);
    try {
      if (isAdmin) {
        await adminUpdateAttendanceStatus(rec.id, draftStatus, draftRemarks);
      } else {
        await updateAttendanceRemarks(rec.id, draftRemarks);
      }
      setEditingId(null);
      setActionFeedback('Attendance note saved.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingNew(true);
    setActionFeedback(null);
    const course = courses.find((c) => c.courseCode === newCourseCode) || courses[0];
    try {
      await adminCreateAttendance({
        studentId: student.id,
        ownerUid: student.ownerUid,
        courseCode: course?.courseCode || newCourseCode,
        courseName: course?.courseName || newCourseCode,
        date: newDate,
        period: newPeriod,
        status: newStatus,
        remarks: newRemarks,
        recordedBy: course?.instructor || 'Registrar Office',
      });
      setNewRemarks('');
      setShowAddForm(false);
      setActionFeedback('Attendance entry recorded.');
    } finally {
      setSubmittingNew(false);
    }
  };

  const renderStatus = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            Late
          </span>
        );
      case 'Excused':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            Excused
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            Absent
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            {student.fullName} · {student.studentCode}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Attendance Register
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Entry Form' : 'Record Attendance'}
          </button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 mb-1">Attendance Rate</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {stats.ratePct.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 mb-1">Present</p>
          <p className="text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
            {stats.present}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 mb-1">Excused</p>
          <p className="text-2xl font-semibold text-sky-700 font-mono tabular-nums">
            {stats.excused}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 mb-1">Late</p>
          <p className="text-2xl font-semibold text-amber-700 font-mono tabular-nums">
            {stats.late}
          </p>
        </div>
        <div className="p-4 sm:p-5 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 mb-1">Absent</p>
          <p className="text-2xl font-semibold text-red-700 font-mono tabular-nums">
            {stats.absent}
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          {actionFeedback}
        </div>
      )}

      {/* Admin Add Attendance Form */}
      {isAdmin && showAddForm && (
        <form
          onSubmit={handleCreateAttendance}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            New Attendance Entry for {student.fullName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Course</label>
              <select
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                {courses.map((c) => (
                  <option key={c.courseCode} value={c.courseCode}>
                    {c.courseCode} — {c.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Period</label>
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Period 1">Period 1</option>
                <option value="Period 2">Period 2</option>
                <option value="Period 3">Period 3</option>
                <option value="Period 4">Period 4</option>
                <option value="Period 5">Period 5</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Remarks / Faculty Note (optional)
            </label>
            <input
              type="text"
              maxLength={240}
              value={newRemarks}
              onChange={(e) => setNewRemarks(e.target.value)}
              placeholder="e.g., Approved medical absence or tardy pass"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingNew}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {submittingNew ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(['All', 'Present', 'Late', 'Excused', 'Absent'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            aria-label="Filter by course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode} · {c.courseName}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search date, subject, or note..."
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <p className="text-sm font-medium text-slate-900 mb-1">No matching attendance records</p>
            <p className="text-xs text-slate-500">
              Adjust your course filter, status tab, or search term to view entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Date & Period</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Faculty / Notes</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((rec) => {
                  const isEditing = editingId === rec.id;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors align-top">
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <p className="font-mono text-xs font-medium text-slate-900 tabular-nums">
                          {rec.date}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.period}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{rec.courseName}</p>
                        <p className="font-mono text-xs text-slate-500 mt-0.5">
                          {rec.courseCode} · {rec.recordedBy}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isEditing && isAdmin ? (
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value as AttendanceStatus)}
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white"
                          >
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                            <option value="Absent">Absent</option>
                          </select>
                        ) : (
                          renderStatus(rec.status)
                        )}
                      </td>
                      <td className="py-3.5 px-4 min-w-[220px]">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              maxLength={240}
                              value={draftRemarks}
                              onChange={(e) => setDraftRemarks(e.target.value)}
                              placeholder="Add absence explanation or faculty note..."
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#1E3A5F]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={savingId === rec.id}
                                onClick={() => handleSaveEdit(rec)}
                                className="px-3 py-1 text-xs font-medium text-white bg-[#1E3A5F] rounded-md hover:bg-[#162C49] cursor-pointer"
                              >
                                {savingId === rec.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {rec.remarks ? rec.remarks : <span className="text-slate-400">No remarks</span>}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {!isEditing && (isAdmin || rec.status === 'Absent' || rec.status === 'Late' || rec.status === 'Excused') && (
                            <button
                              type="button"
                              onClick={() => startEditing(rec)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-[#1E3A5F] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5" />
                              {isAdmin ? 'Edit' : rec.remarks ? 'Edit Note' : 'Add Note'}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => adminDeleteAttendance(rec.id)}
                              aria-label="Delete attendance record"
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
