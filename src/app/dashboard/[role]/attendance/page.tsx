'use client';

import { CombinedAttendanceManagement } from '@/components/dashboard/attendance/CombinedAttendanceManagement';

export default function AttendancePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>
      <CombinedAttendanceManagement />
    </div>
  );
}
