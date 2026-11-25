# Northbridge Academy Security Specification

## 1. Data Invariants
1. **Student Identity & PII Isolation**: Every student document in `/students/{studentId}` contains PII (`email`, `phone`, `address`, `guardianName`, `guardianPhone`, `guardianEmail`). Only the owning student (`existing().ownerUid == request.auth.uid`) or a verified administrator (`request.auth.token.email == 'nandanbh4@gmail.com' && request.auth.token.email_verified == true`) may read (`get` or `list`) student documents.
2. **No Self-Assigned Roles**: Students creating their own profile document must use `studentId == request.auth.uid`, `ownerUid == request.auth.uid`, and `role == 'student'`. Students cannot escalate `role`, `academicStanding`, `studentCode`, `gradeLevel`, or `section` on update.
3. **Referential Integrity on Academic Records**: Attendance (`/attendance/{recordId}`) and Marks (`/marks/{markId}`) documents cannot be orphaned; student-created starter records must verify that the parent `/students/{studentId}` document exists and belongs to `request.auth.uid`.
4. **Immutable Ownership & Timestamps**: `ownerUid`, `studentId`, and `createdAt` are immutable after document creation. `createdAt` on create and `updatedAt` on create/update must strictly equal `request.time`.
5. **Action-Scoped Student Updates**: Students may only update contact/profile fields on `/students/{studentId}` and only `remarks` (excuse notes) on `/attendance/{recordId}`. Only administrators may modify attendance `status` or any field in `/marks/{markId}`.
6. **Public School Catalog Only for Verified Users**: `/courses` and `/announcements` contain zero PII and are readable only by email-verified signed-in users, and writable strictly by verified administrators.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unverified Email Admin Spoof**: `request.auth.token.email == 'nandanbh4@gmail.com'`, `email_verified == false` attempting to list `/students`. Expected: `PERMISSION_DENIED`.
2. **Role Escalation on Create**: Student creates `/students/{uid}` with `role: 'admin'`. Expected: `PERMISSION_DENIED`.
3. **Shadow Field Injection on Student Update**: Student updates `/students/{uid}` with `{ phone: '555-0199', academicStanding: 'Honors Roll', updatedAt: serverTimestamp() }`. Expected: `PERMISSION_DENIED`.
4. **Cross-Student PII Read**: Student A calls `getDoc` on `/students/{studentB}`. Expected: `PERMISSION_DENIED`.
5. **Blanket Student List Scrape**: Student A runs `getDocs(collection(db, 'students'))` without `where('ownerUid', '==', uid)`. Expected: `PERMISSION_DENIED`.
6. **Student Tampering with Attendance Status**: Student updates `/attendance/{recordId}` changing `status: 'Absent'` to `'Present'`. Expected: `PERMISSION_DENIED`.
7. **Student Creating or Modifying Marks**: Student updates `/marks/{markId}` changing `score: 65` to `score: 100`. Expected: `PERMISSION_DENIED`.
8. **Score Exceeding MaxScore**: Admin writes `/marks/{markId}` with `score: 120, maxScore: 100`. Expected: `PERMISSION_DENIED`.
9. **Client-Spoofed Timestamp**: Client writes `createdAt: Timestamp.fromDate(new Date('2020-01-01'))` instead of `request.time`. Expected: `PERMISSION_DENIED`.
10. **ID Poisoning Attack**: Client attempts write to `/students/` with a 200-character invalid ID containing spaces or `$`. Expected: `PERMISSION_DENIED`.
11. **1MB String Resource Exhaustion**: Student updates `bio` with a 5,000-character string exceeding `maxLength: 400`. Expected: `PERMISSION_DENIED`.
12. **Orphaned Attendance Record**: Student creates `/attendance/{id}` referencing a non-existent `studentId` or another user's `studentId`. Expected: `PERMISSION_DENIED`.
