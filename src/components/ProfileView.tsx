import React, { useEffect, useState } from 'react';
import { Check, RotateCcw, Save, User } from 'lucide-react';
import { StudentContactPatch, updateStudentContactProfile } from '../services/schoolService';
import { CourseItem, StudentProfile } from '../types';

interface ProfileViewProps {
  student: StudentProfile;
  courses: CourseItem[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ student, courses }) => {
  const [form, setForm] = useState<StudentContactPatch>({
    preferredName: student.preferredName || '',
    phone: student.phone || '',
    address: student.address || '',
    dateOfBirth: student.dateOfBirth || '',
    guardianName: student.guardianName || '',
    guardianPhone: student.guardianPhone || '',
    guardianEmail: student.guardianEmail || '',
    bio: student.bio || '',
  });
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setForm({
      preferredName: student.preferredName || '',
      phone: student.phone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      bio: student.bio || '',
    });
    setImgError(false);
  }, [student]);

  const handleReset = () => {
    setForm({
      preferredName: student.preferredName || '',
      phone: student.phone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      bio: student.bio || '',
    });
    setSavedNotice(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await updateStudentContactProfile(student.id, form);
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Institutional Student Identity Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
            {student.avatarUrl && !imgError ? (
              <img
                src={student.avatarUrl}
                alt={`${student.fullName} portrait`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9 text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-mono font-medium text-[#1E3A5F]">{student.studentCode}</span>
              <span aria-hidden="true">·</span>
              <span>{student.gradeLevel}</span>
              <span aria-hidden="true">·</span>
              <span>Section {student.section}</span>
              {student.house && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{student.house}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {student.fullName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {student.email} · Academic Standing: <span className="font-medium text-slate-900">{student.academicStanding}</span>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 mr-1.5">Faculty Advisor:</span>
                <span className="font-medium text-slate-800">{student.advisorName}</span>
              </div>
              <div>
                <span className="text-slate-400 mr-1.5">Enrolled Since:</span>
                <span className="font-mono tabular-nums font-medium text-slate-800">{student.enrollmentDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Guardian Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Contact & Guardian Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep personal details and emergency guardian records updated for the Registrar Office.
            </p>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check className="w-4 h-4" />
              Profile updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Preferred Name
            </label>
            <input
              type="text"
              maxLength={60}
              value={form.preferredName}
              onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Student Phone Number
            </label>
            <input
              type="tel"
              maxLength={30}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Residential Address
            </label>
            <input
              type="text"
              maxLength={240}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Primary Guardian Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Guardian Full Name
              </label>
              <input
                type="text"
                maxLength={100}
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Guardian Phone
              </label>
              <input
                type="tel"
                maxLength={30}
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Guardian Email
              </label>
              <input
                type="email"
                maxLength={120}
                value={form.guardianEmail}
                onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Academic Focus & Extracurricular Bio
          </label>
          <textarea
            rows={3}
            maxLength={400}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F] resize-none"
          />
          <p className="mt-1 text-xs text-slate-400 font-mono tabular-nums text-right">
            {form.bio.length}/400
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Enrolled Courses Roster */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Enrolled Course Schedule</h2>
          <span className="text-xs text-slate-500">Fall 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                <th className="py-3 px-6">Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-6 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {courses.map((c) => (
                <tr key={c.courseCode} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6 font-mono text-xs font-medium text-[#1E3A5F] whitespace-nowrap">
                    {c.courseCode}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{c.courseName}</p>
                    <p className="text-xs text-slate-500">{c.department}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">{c.instructor}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{c.schedule}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{c.room}</td>
                  <td className="py-3 px-6 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {c.credits.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
