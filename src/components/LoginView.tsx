import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { CAMPUS_COURTYARD_IMG } from '../data/seedData';
import { auth, googleProvider } from '../firebase';

type AuthMode = 'signin' | 'signup';

function formatAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  const message = err instanceof Error ? err.message : 'Authentication failed.';

  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return 'Email/password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method → Email/Password).';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Switch to Sign In to access it.';
  }
  if (code === 'auth/weak-password') {
    return 'Password must be at least 6 characters long.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many consecutive attempts. Please wait a moment before trying again.';
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return 'Google sign-in window was closed before completing authentication.';
  }
  return message;
}

export const LoginView: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: fullName.trim().slice(0, 100) });
        await sendEmailVerification(cred.user);
      }
    } catch (err) {
      setErrorMsg(formatAuthError(err));
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Enter your email address above first, then click Forgot password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setInfoMsg(`Password reset instructions sent to ${trimmedEmail}.`);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Campus Showcase */}
      <div className="relative lg:col-span-7 min-h-[280px] lg:min-h-screen bg-slate-900 overflow-hidden flex flex-col justify-between">
        {!imgFailed ? (
          <img
            src={CAMPUS_COURTYARD_IMG}
            alt="Northbridge Academy morning courtyard and glass library atrium"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#0F172A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/35" />

        <div className="relative z-10 p-8 lg:p-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/95 text-[#1E3A5F] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-semibold text-white tracking-tight text-lg whitespace-nowrap">
              Northbridge Academy
            </span>
          </div>
          <span className="text-xs text-slate-200/90 font-medium tracking-wide">
            Academic Year 2026–2027
          </span>
        </div>

        <div className="relative z-10 p-8 lg:p-12 max-w-2xl">
          <p className="text-xs font-medium text-slate-200 tracking-wide mb-3">
            Student & Faculty Information System
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-[1.14] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Academic records, attendance, and coursework in one unified portal.
          </h1>
          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl">
            Review daily period attendance, monitor weighted examination marks across terms, and keep student and guardian records current.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6 text-white">
            <div>
              <p className="text-xs text-slate-300 mb-1">Attendance Ledger</p>
              <p className="text-sm font-medium">Period-by-period tracking</p>
            </div>
            <div>
              <p className="text-xs text-slate-300 mb-1">Marks & GPA</p>
              <p className="text-sm font-medium">Weighted term transcripts</p>
            </div>
            <div>
              <p className="text-xs text-slate-300 mb-1">Student Directory</p>
              <p className="text-sm font-medium">Verified profile records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Authentication Panel */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white border-l border-slate-200">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p className="text-xs font-medium text-[#1E3A5F] mb-2">
              Portal Sign In
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1.5">
              {mode === 'signin' ? 'Access your student account' : 'Create a student account'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {mode === 'signin'
                ? 'Sign in with your school email and password or continue with Google.'
                : 'Register with your email address to initialize your student portal.'}
            </p>
          </div>

          {/* Segmented Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 leading-relaxed"
            >
              {infoMsg}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jordan Vance"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@northbridge.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' ? 'Enter your password' : 'At least 6 characters'}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A5F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
            >
              <span>
                {loading
                  ? mode === 'signin'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'signin'
                    ? 'Sign In with Email'
                    : 'Create Student Account'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-800 text-sm font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-7 pt-5 border-t border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
              <span>Real-time GPA standing, credit load, and daily schedule</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
              <span>Course attendance register and absence note submissions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
              <span>Weighted term transcripts and printable grade reports</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
              <span>Protected student and guardian contact directory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
