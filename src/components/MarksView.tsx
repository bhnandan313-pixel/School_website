import React, { useMemo, useState } from 'react';
import { Plus, Printer, Search, Trash2 } from 'lucide-react';
import { adminCreateMark, adminDeleteMark } from '../services/schoolService';
import { AcademicTerm, AssessmentType, CourseItem, MarkEntry, StudentProfile } from '../types';
import { computeCourseSummaries, computeOverallGpa, pctToLetterGrade } from '../utils/academics';

interface MarksViewProps {
  student: StudentProfile;
  marks: MarkEntry[];
  courses: CourseItem[];
  isAdmin: boolean;
}

export const MarksView: React.FC<MarksViewProps> = ({
  student,
  marks,
  courses,
  isAdmin,
}) => {
  const [termFilter, setTermFilter] = useState<'ALL' | AcademicTerm>('Fall 2026');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin add mark form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.courseCode || 'MATH-401');
  const [newTerm, setNewTerm] = useState<AcademicTerm>('Fall 2026');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssessmentType>('Exam');
  const [newScore, setNewScore] = useState('90');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newWeight, setNewWeight] = useState('25');
  const [newDate, setNewDate] = useState('2026-11-25');
  const [newFeedback, setNewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const termMarks = useMemo(() => {
    if (termFilter === 'ALL') return marks;
    return marks.filter((m) => m.term === termFilter);
  }, [marks, termFilter]);

  const summaries = useMemo(
    () => computeCourseSummaries(termMarks, courses),
    [termMarks, courses]
  );

  const gpa = useMemo(() => computeOverallGpa(summaries), [summaries]);

  const highestSubject = useMemo(() => {
    if (summaries.length === 0) return null;
    return [...summaries].sort((a, b) => b.weightedPct - a.weightedPct)[0];
  }, [summaries]);

  const filteredAssessments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return termMarks.filter((m) => {
      if (courseFilter !== 'ALL' && m.courseCode !== courseFilter) return false;
      if (q) {
        const hay = `${m.assessmentTitle} ${m.courseName} ${m.courseCode} ${m.assessmentType} ${m.teacherName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [termMarks, courseFilter, searchTerm]);

  const handleCreateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    setFeedbackBanner(null);
    const course = courses.find((c) => c.courseCode === newCourseCode) || courses[0];
    try {
      await adminCreateMark({
        studentId: student.id,
        ownerUid: student.ownerUid,
        courseCode: course?.courseCode || newCourseCode,
        courseName: course?.courseName || newCourseCode,
        term: newTerm,
        assessmentTitle: newTitle,
        assessmentType: newType,
        score: Number(newScore),
        maxScore: Number(newMaxScore),
        weightPct: Number(newWeight),
        teacherName: course?.instructor || 'Faculty Member',
        gradedDate: newDate,
        feedback: newFeedback,
      });
      setNewTitle('');
      setNewFeedback('');
      setShowAddForm(false);
      setFeedbackBanner('Assessment mark added to transcript.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            {student.fullName} · {student.studentCode} · {student.gradeLevel}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Marks & Academic Transcript
          </h1>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Transcript
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Close Form' : 'Add Mark'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-1">Term Weighted GPA</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {gpa > 0 ? gpa.toFixed(2) : '—'} <span className="text-xs font-normal text-slate-500">/ 4.00</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-1">Graded Assessments</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {termMarks.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-1">Highest Performing Subject</p>
          {highestSubject ? (
            <p className="text-base font-semibold text-slate-900 truncate">
              {highestSubject.courseName}{' '}
              <span className="font-mono text-sm text-[#1E3A5F] tabular-nums ml-1">
                {highestSubject.weightedPct.toFixed(1)}% ({highestSubject.letterGrade})
              </span>
            </p>
          ) : (
            <p className="text-sm text-slate-500">No grades yet</p>
          )}
        </div>
      </div>

      {feedbackBanner && (
        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          {feedbackBanner}
        </div>
      )}

      {/* Admin Add Mark Form */}
      {isAdmin && showAddForm && (
        <form
          onSubmit={handleCreateMark}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 no-print"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Record New Mark for {student.fullName}
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Term</label>
              <select
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value as AcademicTerm)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Fall 2026">Fall 2026</option>
                <option value="Spring 2026">Spring 2026</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AssessmentType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Graded Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Assessment Title</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Unit 4 Integration Quiz"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Score</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={Number(newMaxScore) || 1000}
                  step="0.5"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Max Score</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={1000}
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Weight (%)</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Faculty Feedback</label>
            <input
              type="text"
              maxLength={400}
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Optional rubric feedback for the student"
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
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Mark'}
            </button>
          </div>
        </form>
      )}

      {/* Term Selector & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(['Fall 2026', 'Spring 2026', 'ALL'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTermFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                termFilter === t
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'ALL' ? 'All Terms' : t}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            aria-label="Filter marks by course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
          >
            <option value="ALL">All Subjects</option>
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
              placeholder="Search assessment or instructor..."
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>
        </div>
      </div>

      {/* Subject Grade Summary Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Course Standing Summary</h2>
          <span className="text-xs text-slate-500">
            {termFilter === 'ALL' ? 'Cumulative' : termFilter}
          </span>
        </div>

        {summaries.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No subject grades recorded for this term.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4 text-right">Credits</th>
                  <th className="py-3 px-4 text-right">Items</th>
                  <th className="py-3 px-4 text-right">Weighted %</th>
                  <th className="py-3 px-4 text-right">Grade</th>
                  <th className="py-3 px-6 text-right">GPA Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {summaries.map((s) => (
                  <tr key={s.courseCode} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-xs text-slate-500 mr-2.5">{s.courseCode}</span>
                      <span className="font-medium text-slate-900">{s.courseName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{s.instructor}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {s.credits.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {s.assessmentsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-medium text-slate-900 tabular-nums">
                      {s.weightedPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-[#1E3A5F]">
                      {s.letterGrade}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {s.gpaPoints.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assessment Breakdown Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Individual Assessments</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {filteredAssessments.length} entries
          </span>
        </div>

        {filteredAssessments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No assessments match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Assessment</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Term · Date</th>
                  <th className="py-3 px-4 text-right">Weight</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-6 text-right">Grade</th>
                  {isAdmin && <th className="py-3 px-4 text-right no-print">Remove</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAssessments.map((m) => {
                  const pct = m.maxScore > 0 ? (m.score / m.maxScore) * 100 : 0;
                  const { letter } = pctToLetterGrade(pct);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors align-top">
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-slate-900">{m.assessmentTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {m.assessmentType} · {m.teacherName}
                        </p>
                        {m.feedback && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            “{m.feedback}”
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-mono text-xs text-slate-700">{m.courseCode}</p>
                        <p className="text-xs text-slate-500">{m.courseName}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-xs text-slate-700">{m.term}</p>
                        <p className="font-mono text-xs text-slate-500 tabular-nums mt-0.5">
                          {m.gradedDate}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {m.weightPct}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-900 tabular-nums whitespace-nowrap">
                        {m.score} / {m.maxScore}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-xs whitespace-nowrap">
                        <span className="font-semibold text-[#1E3A5F]">{letter}</span>
                        <span className="text-slate-500 ml-1.5 tabular-nums">({pct.toFixed(1)}%)</span>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right no-print">
                          <button
                            type="button"
                            onClick={() => adminDeleteMark(m.id)}
                            aria-label="Delete mark entry"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
