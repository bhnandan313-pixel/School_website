import { AnnouncementItem, AttendanceStatus, CourseItem, AcademicTerm, AssessmentType } from '../types';

export const PORTRAIT_PRIMARY = '/src/assets/images/avatar_student_primary_1795604747156.jpg';
export const PORTRAIT_SECONDARY = '/src/assets/images/avatar_student_secondary_1795604747634.jpg';
export const CAMPUS_COURTYARD_IMG = '/src/assets/images/login_campus_courtyard_1795604747207.jpg';

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'course-math-401',
    courseCode: 'MATH-401',
    courseName: 'AP Calculus BC',
    department: 'Mathematics',
    instructor: 'Dr. Evelyn Mercer',
    credits: 4.0,
    schedule: 'Mon / Wed / Fri · 08:30 AM',
    room: 'North Hall 204',
  },
  {
    id: 'course-phys-302',
    courseCode: 'PHYS-302',
    courseName: 'Honors Physics: Mechanics',
    department: 'Physical Sciences',
    instructor: 'Prof. Marcus Vance',
    credits: 4.0,
    schedule: 'Tue / Thu · 09:45 AM',
    room: 'Science Atrium 112',
  },
  {
    id: 'course-engl-410',
    courseCode: 'ENGL-410',
    courseName: 'World Literature & Rhetoric',
    department: 'Humanities',
    instructor: 'Claire Holloway',
    credits: 4.0,
    schedule: 'Mon / Wed · 11:15 AM',
    room: 'Library Wing 301',
  },
  {
    id: 'course-cs-350',
    courseCode: 'CS-350',
    courseName: 'Algorithms & Data Structures',
    department: 'Computer Science',
    instructor: 'David Takahashi',
    credits: 4.0,
    schedule: 'Tue / Thu · 01:15 PM',
    room: 'Founders Lab 108',
  },
  {
    id: 'course-hist-305',
    courseCode: 'HIST-305',
    courseName: 'Modern European History',
    department: 'Social Studies',
    instructor: 'Dr. Arthur Pendelton',
    credits: 4.0,
    schedule: 'Mon / Fri · 02:30 PM',
    room: 'North Hall 115',
  },
  {
    id: 'course-chem-310',
    courseCode: 'CHEM-310',
    courseName: 'Organic & Analytical Chemistry',
    department: 'Physical Sciences',
    instructor: 'Dr. Priya Nair',
    credits: 4.0,
    schedule: 'Wed / Fri · 01:15 PM',
    room: 'Science Atrium 205',
  },
];

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-fall-finals',
    title: 'Fall 2026 Final Examination Schedule Released',
    category: 'Examination',
    dateLabel: 'Dec 14 – Dec 18, 2026',
    summary: 'Room assignments and seating rosters for Grade 11 and 12 morning examinations are now finalized. Arrive 15 minutes before the bell.',
    author: 'Office of the Registrar',
  },
  {
    id: 'ann-lab-report',
    title: 'Honors Physics Optics & Kinematics Lab Submission',
    category: 'Deadline',
    dateLabel: 'Nov 30, 2026',
    summary: 'Upload error propagation tables and lab notebooks before 5:00 PM for full Term 2 rubric credit.',
    author: 'Prof. Marcus Vance',
  },
  {
    id: 'ann-honor-convocation',
    title: 'Winter Honors Convocation & Parent Advisory',
    category: 'Academic',
    dateLabel: 'Dec 04, 2026',
    summary: 'Mid-semester academic standing summaries and faculty advisor consultations will be held in the Glass Library Atrium.',
    author: 'Dean of Academics',
  },
  {
    id: 'ann-library-hours',
    title: 'Extended Quiet Study Hours in Founders Library',
    category: 'Campus',
    dateLabel: 'Nov 25 – Dec 18',
    summary: 'Reading rooms remain open until 8:30 PM Monday through Thursday ahead of December assessments.',
    author: 'Campus Operations',
  },
];

export interface StarterAttendanceTemplate {
  courseCode: string;
  courseName: string;
  date: string;
  period: string;
  status: AttendanceStatus;
  remarks: string;
  recordedBy: string;
}

export const STARTER_ATTENDANCE: StarterAttendanceTemplate[] = [
  { courseCode: 'MATH-401', courseName: 'AP Calculus BC', date: '2026-11-24', period: 'Period 1', status: 'Present', remarks: '', recordedBy: 'Dr. Evelyn Mercer' },
  { courseCode: 'ENGL-410', courseName: 'World Literature & Rhetoric', date: '2026-11-24', period: 'Period 3', status: 'Present', remarks: '', recordedBy: 'Claire Holloway' },
  { courseCode: 'HIST-305', courseName: 'Modern European History', date: '2026-11-24', period: 'Period 5', status: 'Present', remarks: '', recordedBy: 'Dr. Arthur Pendelton' },
  { courseCode: 'PHYS-302', courseName: 'Honors Physics: Mechanics', date: '2026-11-23', period: 'Period 2', status: 'Present', remarks: '', recordedBy: 'Prof. Marcus Vance' },
  { courseCode: 'CS-350', courseName: 'Algorithms & Data Structures', date: '2026-11-23', period: 'Period 4', status: 'Present', remarks: '', recordedBy: 'David Takahashi' },
  { courseCode: 'CHEM-310', courseName: 'Organic & Analytical Chemistry', date: '2026-11-20', period: 'Period 4', status: 'Late', remarks: 'Arrived 6 minutes after morning lab briefing.', recordedBy: 'Dr. Priya Nair' },
  { courseCode: 'MATH-401', courseName: 'AP Calculus BC', date: '2026-11-20', period: 'Period 1', status: 'Present', remarks: '', recordedBy: 'Dr. Evelyn Mercer' },
  { courseCode: 'PHYS-302', courseName: 'Honors Physics: Mechanics', date: '2026-11-19', period: 'Period 2', status: 'Present', remarks: '', recordedBy: 'Prof. Marcus Vance' },
  { courseCode: 'CS-350', courseName: 'Algorithms & Data Structures', date: '2026-11-19', period: 'Period 4', status: 'Present', remarks: '', recordedBy: 'David Takahashi' },
  { courseCode: 'ENGL-410', courseName: 'World Literature & Rhetoric', date: '2026-11-18', period: 'Period 3', status: 'Excused', remarks: 'Inter-school debate tournament travel (approved).', recordedBy: 'Claire Holloway' },
  { courseCode: 'MATH-401', courseName: 'AP Calculus BC', date: '2026-11-18', period: 'Period 1', status: 'Present', remarks: '', recordedBy: 'Dr. Evelyn Mercer' },
  { courseCode: 'HIST-305', courseName: 'Modern European History', date: '2026-11-16', period: 'Period 5', status: 'Present', remarks: '', recordedBy: 'Dr. Arthur Pendelton' },
  { courseCode: 'CHEM-310', courseName: 'Organic & Analytical Chemistry', date: '2026-11-13', period: 'Period 4', status: 'Absent', remarks: 'Pending medical note from family.', recordedBy: 'Dr. Priya Nair' },
  { courseCode: 'MATH-401', courseName: 'AP Calculus BC', date: '2026-11-13', period: 'Period 1', status: 'Present', remarks: '', recordedBy: 'Dr. Evelyn Mercer' },
  { courseCode: 'PHYS-302', courseName: 'Honors Physics: Mechanics', date: '2026-11-12', period: 'Period 2', status: 'Present', remarks: '', recordedBy: 'Prof. Marcus Vance' },
  { courseCode: 'CS-350', courseName: 'Algorithms & Data Structures', date: '2026-11-12', period: 'Period 4', status: 'Present', remarks: '', recordedBy: 'David Takahashi' },
];

export interface StarterMarkTemplate {
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
  feedback: string;
}

export const STARTER_MARKS: StarterMarkTemplate[] = [
  {
    courseCode: 'MATH-401',
    courseName: 'AP Calculus BC',
    term: 'Fall 2026',
    assessmentTitle: 'Taylor Series & Convergence Midterm',
    assessmentType: 'Exam',
    score: 94,
    maxScore: 100,
    weightPct: 35,
    teacherName: 'Dr. Evelyn Mercer',
    gradedDate: '2026-11-18',
    feedback: 'Strong command of ratio test bounds and remainder estimation.',
  },
  {
    courseCode: 'MATH-401',
    courseName: 'AP Calculus BC',
    term: 'Fall 2026',
    assessmentTitle: 'Parametric Curves Problem Set',
    assessmentType: 'Assignment',
    score: 48,
    maxScore: 50,
    weightPct: 15,
    teacherName: 'Dr. Evelyn Mercer',
    gradedDate: '2026-11-04',
    feedback: 'Clean arc-length derivations.',
  },
  {
    courseCode: 'PHYS-302',
    courseName: 'Honors Physics: Mechanics',
    term: 'Fall 2026',
    assessmentTitle: 'Rotational Dynamics Lab Report',
    assessmentType: 'Lab',
    score: 45,
    maxScore: 50,
    weightPct: 25,
    teacherName: 'Prof. Marcus Vance',
    gradedDate: '2026-11-15',
    feedback: 'Well-calibrated moment of inertia error bars.',
  },
  {
    courseCode: 'PHYS-302',
    courseName: 'Honors Physics: Mechanics',
    term: 'Fall 2026',
    assessmentTitle: 'Conservation Laws Midterm',
    assessmentType: 'Exam',
    score: 88,
    maxScore: 100,
    weightPct: 35,
    teacherName: 'Prof. Marcus Vance',
    gradedDate: '2026-10-29',
    feedback: 'Review non-inertial frame sign conventions on Question 4.',
  },
  {
    courseCode: 'ENGL-410',
    courseName: 'World Literature & Rhetoric',
    term: 'Fall 2026',
    assessmentTitle: 'Comparative Rhetoric Seminar Essay',
    assessmentType: 'Project',
    score: 96,
    maxScore: 100,
    weightPct: 40,
    teacherName: 'Claire Holloway',
    gradedDate: '2026-11-12',
    feedback: 'Nuanced close reading and persuasive structural pacing.',
  },
  {
    courseCode: 'CS-350',
    courseName: 'Algorithms & Data Structures',
    term: 'Fall 2026',
    assessmentTitle: 'Graph Traversal & Shortest Path Benchmark',
    assessmentType: 'Project',
    score: 97,
    maxScore: 100,
    weightPct: 30,
    teacherName: 'David Takahashi',
    gradedDate: '2026-11-20',
    feedback: 'Optimal O((V+E) log V) priority queue implementation.',
  },
  {
    courseCode: 'CS-350',
    courseName: 'Algorithms & Data Structures',
    term: 'Fall 2026',
    assessmentTitle: 'Balanced Trees & Heaps Quiz',
    assessmentType: 'Quiz',
    score: 28,
    maxScore: 30,
    weightPct: 15,
    teacherName: 'David Takahashi',
    gradedDate: '2026-11-02',
    feedback: 'Accurate AVL rotation traces.',
  },
  {
    courseCode: 'HIST-305',
    courseName: 'Modern European History',
    term: 'Fall 2026',
    assessmentTitle: 'Primary Source Synthesis Exam',
    assessmentType: 'Exam',
    score: 89,
    maxScore: 100,
    weightPct: 35,
    teacherName: 'Dr. Arthur Pendelton',
    gradedDate: '2026-11-10',
    feedback: 'Thorough contextualization of 19th-century diplomatic archives.',
  },
  {
    courseCode: 'CHEM-310',
    courseName: 'Organic & Analytical Chemistry',
    term: 'Fall 2026',
    assessmentTitle: 'Titration & Spectroscopy Practical',
    assessmentType: 'Lab',
    score: 42,
    maxScore: 50,
    weightPct: 25,
    teacherName: 'Dr. Priya Nair',
    gradedDate: '2026-11-14',
    feedback: 'Good IR peak identification; tighten volumetric endpoint precision.',
  },
  {
    courseCode: 'MATH-401',
    courseName: 'AP Calculus BC',
    term: 'Spring 2026',
    assessmentTitle: 'Differential Equations Capstone',
    assessmentType: 'Exam',
    score: 92,
    maxScore: 100,
    weightPct: 40,
    teacherName: 'Dr. Evelyn Mercer',
    gradedDate: '2026-05-19',
    feedback: 'Excellent Euler method and logistic modeling write-up.',
  },
  {
    courseCode: 'ENGL-410',
    courseName: 'World Literature & Rhetoric',
    term: 'Spring 2026',
    assessmentTitle: 'Spring Portfolio Defense',
    assessmentType: 'Project',
    score: 91,
    maxScore: 100,
    weightPct: 35,
    teacherName: 'Claire Holloway',
    gradedDate: '2026-05-22',
    feedback: 'Clear thesis progression across all three essays.',
  },
];
