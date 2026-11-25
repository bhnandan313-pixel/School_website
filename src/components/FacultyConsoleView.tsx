import React, { useState } from 'react';
import { Check, UserPlus, Users } from 'lucide-react';
import { adminCreateStudent } from '../services/schoolService';
import { GradeLevel, PortalTab, StudentProfile } from '../types';

interface FacultyConsoleViewProps {
  adminUid: string;
  students: StudentProfile[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onNavigate: (tab: PortalTab) => void;
}

export const FacultyConsoleView: React.FC<FacultyConsoleViewProps> = ({
  adminUid,
  students,
  selectedStudentId,
  onSelectStudent,
  onNavigate,
}) => {
  const [showEnroll, setShowEnroll] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('NB-2026-0512');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('Grade 11');
  const [section, setSection] = useState('11-A');
  const [house, setHouse] = useState('Founders House');
  const [advisorName, setAdvisorName] = useState('Dr. Evelyn Mercer');
  const [creating, setCreating] = useState(false);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setCreating(true);
    try {
      await adminCreateStudent({
        ownerUid: adminUid,
        studentCode,
        fullName,
        email,
        gradeLevel,
        section,
        house,
        advisorName,
      });
      setFullName('');
      setEmail('');
      setShowEnroll(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Registrar & Faculty Administration</p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Student Directory
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowEnroll((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showEnroll ? 'Close Form' : 'Enroll New Student'}
        </button>
      </div>

      {showEnroll && (
        <form
          onSubmit={handleEnroll}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">New Student Enrollment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Maya Lin"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">School Email</label>
              <input
                type="email"
                required
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya.lin@northbridge.edu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Student Code</label>
              <input
                type="text"
                required
                maxLength={32}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Grade Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Section</label>
              <input
                type="text"
                required
                maxLength={20}
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">House</label>
              <input
                type="text"
                maxLength={40}
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Faculty Advisor</label>
              <input
                type="text"
                required
                maxLength={80}
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowEnroll(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-lg disabled:opacity-60 cursor-pointer"
            >
              {creating ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1E3A5F]" />
            <h2 className="text-base font-semibold text-slate-900">Enrolled Students</h2>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">{students.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-4">ID Code</th>
                <th className="py-3 px-4">Grade & Section</th>
                <th className="py-3 px-4">Standing</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((s) => {
                const active = s.id === selectedStudentId;
                return (
                  <tr key={s.id} className={active ? 'bg-slate-50' : 'hover:bg-slate-50/60'}>
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-slate-900">{s.fullName}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {s.studentCode}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                      {s.gradeLevel} · {s.section}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                      {s.academicStanding}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudent(s.id);
                            onNavigate('dashboard');
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1E3A5F] text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" />}
                          {active ? 'Active View' : 'Inspect Portal'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
