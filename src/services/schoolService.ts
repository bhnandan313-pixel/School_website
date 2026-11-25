import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_COURSES,
  PORTRAIT_PRIMARY,
  PORTRAIT_SECONDARY,
  STARTER_ATTENDANCE,
  STARTER_MARKS,
} from '../data/seedData';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
  AnnouncementItem,
  AttendanceRecord,
  AttendanceStatus,
  CourseItem,
  GradeLevel,
  MarkEntry,
  StudentProfile,
} from '../types';

export function isAdminUser(user: User | null): boolean {
  return Boolean(user?.email && user.emailVerified && user.email.toLowerCase() === ADMIN_EMAIL);
}

function makeStudentCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || '0418';
  return `NB-2026-${clean}`;
}

export async function ensureStarterDataForUser(user: User): Promise<void> {
  const admin = isAdminUser(user);

  // 1. Ensure primary student profile for this authenticated user
  const studentRef = doc(db, 'students', user.uid);
  let snap;
  try {
    snap = await getDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `students/${user.uid}`);
  }

  if (!snap.exists()) {
    const batch = writeBatch(db);
    const rawName = (user.displayName || '').trim();
    const fullName = (rawName.length >= 2 ? rawName : 'Jordan Vance').slice(0, 100);
    const rawEmail = (user.email || '').trim();
    const email = (rawEmail.length >= 3 ? rawEmail : 'student@northbridge.edu').slice(0, 120);

    batch.set(studentRef, {
      ownerUid: user.uid,
      studentCode: makeStudentCode(user.uid),
      fullName,
      preferredName: fullName.split(' ')[0] || 'Student',
      email,
      phone: '(555) 234-8910',
      address: '420 Elmwood Avenue, Northbridge, MA 02138',
      gradeLevel: 'Grade 12' as GradeLevel,
      section: '12-A',
      house: 'Founders House',
      advisorName: 'Dr. Evelyn Mercer',
      enrollmentDate: '2023-09-04',
      dateOfBirth: '2009-04-16',
      guardianName: 'Sarah Vance',
      guardianPhone: '(555) 234-8901',
      guardianEmail: 's.vance@familymail.org',
      bio: 'Senior honors student concentrating in applied mathematics, mechanics, and algorithmic problem solving.',
      avatarUrl: PORTRAIT_PRIMARY,
      academicStanding: 'Honors Roll',
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    STARTER_ATTENDANCE.forEach((item, idx) => {
      const attRef = doc(db, 'attendance', `${user.uid}_att_${idx + 1}`);
      batch.set(attRef, {
        studentId: user.uid,
        ownerUid: user.uid,
        courseCode: item.courseCode,
        courseName: item.courseName,
        date: item.date,
        period: item.period,
        status: item.status,
        remarks: item.remarks,
        recordedBy: item.recordedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    STARTER_MARKS.forEach((item, idx) => {
      const markRef = doc(db, 'marks', `${user.uid}_mark_${idx + 1}`);
      batch.set(markRef, {
        studentId: user.uid,
        ownerUid: user.uid,
        courseCode: item.courseCode,
        courseName: item.courseName,
        term: item.term,
        assessmentTitle: item.assessmentTitle,
        assessmentType: item.assessmentType,
        score: item.score,
        maxScore: item.maxScore,
        weightPct: item.weightPct,
        teacherName: item.teacherName,
        gradedDate: item.gradedDate,
        feedback: item.feedback,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${user.uid}`);
    }
  }

  // 2. If user is Admin, ensure shared catalog (courses, announcements) & sample peer student exist
  if (admin) {
    try {
      const coursesSnap = await getDocs(collection(db, 'courses'));
      if (coursesSnap.empty) {
        const batch = writeBatch(db);
        for (const c of DEFAULT_COURSES) {
          batch.set(doc(db, 'courses', c.id), {
            courseCode: c.courseCode,
            courseName: c.courseName,
            department: c.department,
            instructor: c.instructor,
            credits: c.credits,
            schedule: c.schedule,
            room: c.room,
          });
        }
        for (const a of DEFAULT_ANNOUNCEMENTS) {
          batch.set(doc(db, 'announcements', a.id), {
            title: a.title,
            category: a.category,
            dateLabel: a.dateLabel,
            summary: a.summary,
            author: a.author,
          });
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'courses');
    }

    const peerId = 'student_elena_rostova';
    try {
      const peerSnap = await getDoc(doc(db, 'students', peerId));
      if (!peerSnap.exists()) {
        const batch = writeBatch(db);
        batch.set(doc(db, 'students', peerId), {
          ownerUid: user.uid,
          studentCode: 'NB-2026-0392',
          fullName: 'Elena Rostova',
          preferredName: 'Elena',
          email: 'elena.rostova@northbridge.edu',
          phone: '(555) 419-2084',
          address: '118 Birchwood Terrace, Northbridge, MA 02138',
          gradeLevel: 'Grade 11',
          section: '11-B',
          house: 'Atrium House',
          advisorName: 'Claire Holloway',
          enrollmentDate: '2024-09-03',
          dateOfBirth: '2010-08-22',
          guardianName: 'Viktor Rostov',
          guardianPhone: '(555) 419-2080',
          guardianEmail: 'v.rostov@familymail.org',
          bio: 'Junior scholar participating in World Literature seminar and Varsity Debate.',
          avatarUrl: PORTRAIT_SECONDARY,
          academicStanding: 'Honors Roll',
          role: 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        STARTER_ATTENDANCE.slice(0, 6).forEach((item, idx) => {
          batch.set(doc(db, 'attendance', `${peerId}_att_${idx + 1}`), {
            studentId: peerId,
            ownerUid: user.uid,
            courseCode: item.courseCode,
            courseName: item.courseName,
            date: item.date,
            period: item.period,
            status: idx === 2 ? 'Absent' : 'Present',
            remarks: idx === 2 ? 'Regional academic symposium.' : '',
            recordedBy: item.recordedBy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        STARTER_MARKS.slice(0, 5).forEach((item, idx) => {
          batch.set(doc(db, 'marks', `${peerId}_mark_${idx + 1}`), {
            studentId: peerId,
            ownerUid: user.uid,
            courseCode: item.courseCode,
            courseName: item.courseName,
            term: item.term,
            assessmentTitle: item.assessmentTitle,
            assessmentType: item.assessmentType,
            score: Math.max(0, item.score - 2),
            maxScore: item.maxScore,
            weightPct: item.weightPct,
            teacherName: item.teacherName,
            gradedDate: item.gradedDate,
            feedback: item.feedback,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${peerId}`);
    }
  }
}

export function subscribeStudents(
  user: User,
  onData: (students: StudentProfile[]) => void
): () => void {
  const admin = isAdminUser(user);
  const q = admin
    ? query(collection(db, 'students'))
    : query(collection(db, 'students'), where('ownerUid', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<StudentProfile, 'id'>),
      }));
      items.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'students')
  );
}

export function subscribeAttendance(
  user: User,
  onData: (records: AttendanceRecord[]) => void
): () => void {
  const admin = isAdminUser(user);
  const q = admin
    ? query(collection(db, 'attendance'))
    : query(collection(db, 'attendance'), where('ownerUid', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AttendanceRecord, 'id'>),
      }));
      items.sort((a, b) => b.date.localeCompare(a.date));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'attendance')
  );
}

export function subscribeMarks(
  user: User,
  onData: (marks: MarkEntry[]) => void
): () => void {
  const admin = isAdminUser(user);
  const q = admin
    ? query(collection(db, 'marks'))
    : query(collection(db, 'marks'), where('ownerUid', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MarkEntry, 'id'>),
      }));
      items.sort((a, b) => b.gradedDate.localeCompare(a.gradedDate));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'marks')
  );
}

export function subscribeCourses(onData: (courses: CourseItem[]) => void): () => void {
  return onSnapshot(
    collection(db, 'courses'),
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_COURSES);
        return;
      }
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CourseItem, 'id'>),
      }));
      items.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'courses')
  );
}

export function subscribeAnnouncements(onData: (items: AnnouncementItem[]) => void): () => void {
  return onSnapshot(
    collection(db, 'announcements'),
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_ANNOUNCEMENTS);
        return;
      }
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AnnouncementItem, 'id'>),
      }));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'announcements')
  );
}

export interface StudentContactPatch {
  preferredName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  bio: string;
}

export async function updateStudentContactProfile(
  studentId: string,
  patch: StudentContactPatch
): Promise<void> {
  const ref = doc(db, 'students', studentId);
  try {
    await updateDoc(ref, {
      preferredName: patch.preferredName.trim().slice(0, 60),
      phone: patch.phone.trim().slice(0, 30),
      address: patch.address.trim().slice(0, 240),
      dateOfBirth: patch.dateOfBirth.trim().slice(0, 20),
      guardianName: patch.guardianName.trim().slice(0, 100),
      guardianPhone: patch.guardianPhone.trim().slice(0, 30),
      guardianEmail: patch.guardianEmail.trim().slice(0, 120),
      bio: patch.bio.trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
  }
}

export async function updateAttendanceRemarks(recordId: string, remarks: string): Promise<void> {
  const ref = doc(db, 'attendance', recordId);
  try {
    await updateDoc(ref, {
      remarks: remarks.trim().slice(0, 240),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `attendance/${recordId}`);
  }
}

export async function adminCreateAttendance(payload: {
  studentId: string;
  ownerUid: string;
  courseCode: string;
  courseName: string;
  date: string;
  period: string;
  status: AttendanceStatus;
  remarks: string;
  recordedBy: string;
}): Promise<void> {
  const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    await setDoc(doc(db, 'attendance', id), {
      studentId: payload.studentId,
      ownerUid: payload.ownerUid,
      courseCode: payload.courseCode.trim().slice(0, 20),
      courseName: payload.courseName.trim().slice(0, 100),
      date: payload.date,
      period: payload.period.trim().slice(0, 30),
      status: payload.status,
      remarks: payload.remarks.trim().slice(0, 240),
      recordedBy: payload.recordedBy.trim().slice(0, 80),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `attendance/${id}`);
  }
}

export async function adminUpdateAttendanceStatus(
  recordId: string,
  status: AttendanceStatus,
  remarks: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'attendance', recordId), {
      status,
      remarks: remarks.trim().slice(0, 240),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `attendance/${recordId}`);
  }
}

export async function adminDeleteAttendance(recordId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'attendance', recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `attendance/${recordId}`);
  }
}

export async function adminCreateMark(payload: {
  studentId: string;
  ownerUid: string;
  courseCode: string;
  courseName: string;
  term: 'Fall 2026' | 'Spring 2026';
  assessmentTitle: string;
  assessmentType: 'Exam' | 'Quiz' | 'Assignment' | 'Lab' | 'Project';
  score: number;
  maxScore: number;
  weightPct: number;
  teacherName: string;
  gradedDate: string;
  feedback: string;
}): Promise<void> {
  const id = `mark_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const maxScore = Math.max(1, Math.min(1000, Number(payload.maxScore)));
  const score = Math.max(0, Math.min(maxScore, Number(payload.score)));
  const weightPct = Math.max(0, Math.min(100, Number(payload.weightPct)));

  try {
    await setDoc(doc(db, 'marks', id), {
      studentId: payload.studentId,
      ownerUid: payload.ownerUid,
      courseCode: payload.courseCode.trim().slice(0, 20),
      courseName: payload.courseName.trim().slice(0, 100),
      term: payload.term,
      assessmentTitle: payload.assessmentTitle.trim().slice(0, 120),
      assessmentType: payload.assessmentType,
      score,
      maxScore,
      weightPct,
      teacherName: payload.teacherName.trim().slice(0, 80),
      gradedDate: payload.gradedDate,
      feedback: payload.feedback.trim().slice(0, 400),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `marks/${id}`);
  }
}

export async function adminDeleteMark(markId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'marks', markId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `marks/${markId}`);
  }
}

export async function adminCreateStudent(payload: {
  ownerUid: string;
  studentCode: string;
  fullName: string;
  email: string;
  gradeLevel: GradeLevel;
  section: string;
  house: string;
  advisorName: string;
}): Promise<void> {
  const id = `student_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const cleanCode = payload.studentCode.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32) || 'NB-2026-NEW';
  try {
    await setDoc(doc(db, 'students', id), {
      ownerUid: payload.ownerUid,
      studentCode: cleanCode,
      fullName: payload.fullName.trim().slice(0, 100),
      preferredName: payload.fullName.trim().split(' ')[0].slice(0, 60),
      email: payload.email.trim().slice(0, 120),
      phone: '(555) 310-4400',
      address: 'Northbridge Campus Residence',
      gradeLevel: payload.gradeLevel,
      section: payload.section.trim().slice(0, 20) || '10-A',
      house: payload.house.trim().slice(0, 40) || 'North House',
      advisorName: payload.advisorName.trim().slice(0, 80) || 'Dr. Evelyn Mercer',
      enrollmentDate: '2026-09-01',
      dateOfBirth: '2010-05-12',
      guardianName: 'Parent / Guardian',
      guardianPhone: '(555) 310-4401',
      guardianEmail: 'guardian@familymail.org',
      bio: 'Enrolled full-time student.',
      avatarUrl: PORTRAIT_SECONDARY,
      academicStanding: 'Good Standing',
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `students/${id}`);
  }
}
