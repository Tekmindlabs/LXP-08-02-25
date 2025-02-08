import { z } from "zod";

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED"
}

export const attendanceSchema = z.object({
  studentId: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  date: z.date(),
  notes: z.string().optional()
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export interface AttendanceTrend {
  date: string;
  stats: AttendanceStats;
}

