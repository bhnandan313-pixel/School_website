import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification, signOut, User } from 'firebase/auth';
import {
  Award,
  CalendarCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Menu,
  RefreshCw,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { AttendanceView } from './components/AttendanceView';
import { DashboardView } from './components/DashboardView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FacultyConsoleView } from './components/FacultyConsoleView';
import { LoginView } from './components/LoginView';
import { MarksView } from './components/MarksView';
import { ProfileView } from './components/ProfileView';
import { auth } from './firebase';
import {
  ensureStarterDataForUser,
  isAdminUser,
  subscribeAnnouncements,
  subscribeAttendance,
  subscribeCourses,
  subscribeMarks,
  subscribeStudents,
} from './services/schoolService';
import {
  AnnouncementItem,
  AttendanceRecord,
  CourseItem,
  MarkEntry,
  PortalTab,
  StudentProfile,
} from './types';

function PortalApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);
  const [checkingVerify, setCheckingVerify] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsEmailVerified(Boolean(currentUser?.emailVerified));
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !isEmailVerified) {
      setStudents([]);
      setAttendance([]);
      setMarks([]);
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    let unsubStudents: (() => void) | undefined;
    let unsubAttendance: (() => void) | undefined;
    let unsubMarks: (() => void) | undefined;
    let unsubCourses: (() => void) | undefined;
    let unsubAnnouncements: (() => void) | undefined;

    const init = async () => {
      setDataLoading(true);
      await ensureStarterDataForUser(user);
      if (cancelled) return;

      unsubStudents = subscribeStudents(user, (list) => {
        setStudents(list);
        setSelectedStudentId((prev) => {
          if (prev && list.some((s) => s.id === prev)) return prev;
          return list.find((s) => s.id === user.uid)?.id || list[0]?.id || '';
        });
        setDataLoading(false);
      });

      unsubAttendance = subscribeAttendance(user, setAttendance);
      unsubMarks = subscribeMarks(user, setMarks);
      unsubCourses = subscribeCourses(setCourses);
      unsubAnnouncements = subscribeAnnouncements(setAnnouncements);
    };

    void init();

    return () => {
      cancelled = true;
      unsubStudents?.();
      unsubAttendance?.();
      unsubMarks?.();
      unsubCourses?.();
      unsubAnnouncements?.();
    };
  }, [user, isEmailVerified]);

  const isAdmin = useMemo(() => isAdminUser(user), [user]);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  const studentAttendance = useMemo(() => {
    if (!activeStudent) return [];
    return attendance.filter((a) => a.studentId === activeStudent.id);
  }, [attendance, activeStudent]);

  const studentMarks = useMemo(() => {
    if (!activeStudent) return [];
    return marks.filter((m) => m.studentId === activeStudent.id);
  }, [marks, activeStudent]);

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
    setSelectedStudentId('');
    setIsEmailVerified(false);
    setVerifyFeedback(null);
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setCheckingVerify(true);
    setVerifyFeedback(null);
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const verified = Boolean(auth.currentUser.emailVerified);
      setIsEmailVerified(verified);
      if (!verified) {
        setVerifyFeedback('Email is not verified yet. Please click the verification link in your inbox.');
      }
    } catch (err) {
      setVerifyFeedback(err instanceof Error ? err.message : 'Unable to refresh verification status.');
    } finally {
      setCheckingVerify(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setVerifyFeedback(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifyFeedback(`Verification email resent to ${auth.currentUser.email}.`);
    } catch (err) {
      setVerifyFeedback(err instanceof Error ? err.message : 'Unable to resend verification email.');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500 font-medium">Loading Northbridge Academy...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#1E3A5F] mb-1">Email Verification Required</p>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Confirm your email address
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">
              We sent a verification link to <span className="font-medium text-slate-900">{user.email}</span>. Open the link in your inbox, then continue to your student portal.
            </p>
          </div>

          {verifyFeedback && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              {verifyFeedback}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleRefreshVerification}
              disabled={checkingVerify}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checkingVerify ? 'animate-spin' : ''}`} />
              {checkingVerify ? 'Checking status...' : "I've Verified — Continue"}
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Sign out and use another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: PortalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'marks', label: 'Marks', icon: Award },
    { id: 'profile', label: 'Student Profile', icon: UserCircle2 },
  ];

  if (isAdmin) {
    navItems.push({ id: 'faculty', label: 'Student Directory', icon: Users });
  }

  const activeLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar (248px) */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 no-print">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight whitespace-nowrap">
            Northbridge
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Portal navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {isAdmin && students.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Active Student View
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-[#1E3A5F]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {user.displayName || 'Portal User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col border-r border-slate-200 z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900">Northbridge</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0">
        {/* Top Bar (3-zone contract) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-8 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap truncate">
              <span className="text-slate-400 hidden sm:inline">Northbridge Academy</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-medium text-slate-900">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap">
              {isAdmin ? 'Faculty & Student Access' : 'Student Portal'} · Fall 2026
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1200px] w-full mx-auto">
          {dataLoading || !activeStudent ? (
            <div className="space-y-6">
              <div className="h-16 bg-white border border-slate-200 rounded-xl animate-pulse" />
              <div className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
              <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  student={activeStudent}
                  attendance={studentAttendance}
                  marks={studentMarks}
                  courses={courses}
                  announcements={announcements}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'attendance' && (
                <AttendanceView
                  student={activeStudent}
                  records={studentAttendance}
                  courses={courses}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'marks' && (
                <MarksView
                  student={activeStudent}
                  marks={studentMarks}
                  courses={courses}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileView student={activeStudent} courses={courses} />
              )}
              {activeTab === 'faculty' && isAdmin && (
                <FacultyConsoleView
                  adminUid={user.uid}
                  students={students}
                  selectedStudentId={activeStudent.id}
                  onSelectStudent={setSelectedStudentId}
                  onNavigate={setActiveTab}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortalApp />
    </ErrorBoundary>
  );
}
