import { AttendanceRecord, CourseItem, MarkEntry } from '../types';

export interface CourseGradeSummary {
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  assessmentsCount: number;
  weightedPct: number;
  letterGrade: string;
  gpaPoints: number;
}

export function pctToLetterGrade(pct: number): { letter: string; gpa: number } {
  if (pct >= 93) return { letter: 'A', gpa: 4.0 };
  if (pct >= 90) return { letter: 'A-', gpa: 3.7 };
  if (pct >= 87) return { letter: 'B+', gpa: 3.3 };
  if (pct >= 83) return { letter: 'B', gpa: 3.0 };
  if (pct >= 80) return { letter: 'B-', gpa: 2.7 };
  if (pct >= 77) return { letter: 'C+', gpa: 2.3 };
  if (pct >= 73) return { letter: 'C', gpa: 2.0 };
  if (pct >= 70) return { letter: 'C-', gpa: 1.7 };
  if (pct >= 67) return { letter: 'D+', gpa: 1.3 };
  if (pct >= 60) return { letter: 'D', gpa: 1.0 };
  return { letter: 'F', gpa: 0.0 };
}

export function computeCourseSummaries(
  marks: MarkEntry[],
  courses: CourseItem[]
): CourseGradeSummary[] {
  const byCode = new Map<string, MarkEntry[]>();
  for (const m of marks) {
    const existing = byCode.get(m.courseCode) ?? [];
    existing.push(m);
    byCode.set(m.courseCode, existing);
  }

  const summaries: CourseGradeSummary[] = [];

  for (const [courseCode, entries] of byCode.entries()) {
    const courseMeta = courses.find((c) => c.courseCode === courseCode);
    let totalWeight = 0;
    let weightedSum = 0;

    for (const entry of entries) {
      const pct = entry.maxScore > 0 ? (entry.score / entry.maxScore) * 100 : 0;
      const w = entry.weightPct > 0 ? entry.weightPct : 1;
      weightedSum += pct * w;
      totalWeight += w;
    }

    const weightedPct = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const { letter, gpa } = pctToLetterGrade(weightedPct);

    summaries.push({
      courseCode,
      courseName: courseMeta?.courseName || entries[0]?.courseName || courseCode,
      instructor: courseMeta?.instructor || entries[0]?.teacherName || 'Faculty',
      credits: courseMeta?.credits ?? 4.0,
      assessmentsCount: entries.length,
      weightedPct,
      letterGrade: letter,
      gpaPoints: gpa,
    });
  }

  return summaries.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

export function computeOverallGpa(summaries: CourseGradeSummary[]): number {
  if (summaries.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;
  for (const s of summaries) {
    totalPoints += s.gpaPoints * s.credits;
    totalCredits += s.credits;
  }
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function computeAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  let present = 0;
  let late = 0;
  let absent = 0;
  let excused = 0;

  for (const r of records) {
    if (r.status === 'Present') present += 1;
    else if (r.status === 'Late') late += 1;
    else if (r.status === 'Absent') absent += 1;
    else if (r.status === 'Excused') excused += 1;
  }

  // Present + Excused + 0.5*Late credit toward attendance rate
  const attendedEquivalent = present + excused + late * 0.5;
  const ratePct = total > 0 ? (attendedEquivalent / total) * 100 : 100;

  return {
    total,
    present,
    late,
    absent,
    excused,
    ratePct,
  };
}
