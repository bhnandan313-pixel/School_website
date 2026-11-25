export type GradeLevel = 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';
export type AcademicStanding = 'Honors Roll' | 'Good Standing' | 'Academic Watch';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type AcademicTerm = 'Fall 2026' | 'Spring 2026';
export type AssessmentType = 'Exam' | 'Quiz' | 'Assignment' | 'Lab' | 'Project';
export type AnnouncementCategory = 'Academic' | 'Examination' | 'Campus' | 'Deadline';

export interface StudentProfile {
  id: string;
  ownerUid: string;
  studentCode: string;
  fullName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  address?: string;
  gradeLevel: GradeLevel;
  section: string;
  house?: string;
  advisorName: string;
  enrollmentDate: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  bio?: string;
  avatarUrl?: string;
  academicStanding: AcademicStanding;
  role: 'student';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  ownerUid: string;
  courseCode: string;
  courseName: string;
  date: string;
  period: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MarkEntry {
  id: string;
  studentId: string;
  ownerUid: string;
  courseCode: string;
  courseName: string;
  term: AcademicTerm;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  score: number;
  maxScore: number;
  weightPct: number;
  teacherName: string;
  gradedDate: string;
  feedback?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CourseItem {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: AnnouncementCategory;
  dateLabel: string;
  summary: string;
  author: string;
}

export type PortalTab = 'dashboard' | 'attendance' | 'marks' | 'profile' | 'faculty';
