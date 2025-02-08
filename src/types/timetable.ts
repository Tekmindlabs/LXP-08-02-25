import { z } from "zod";

export const breakTimeSchema = z.object({
	startTime: z.string(), // HH:mm format
	endTime: z.string(),
	type: z.enum(["SHORT_BREAK", "LUNCH_BREAK"]),
	dayOfWeek: z.number().min(1).max(7)
});

export const periodInputSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
	dayOfWeek: z.number().min(1).max(7),
	subjectId: z.string(),
	teacherId: z.string(),
	classroomId: z.string(),
	durationInMinutes: z.number().default(45)
});

export const timetableInputSchema = z.object({
	termId: z.string(),
	classGroupId: z.string(),
	classId: z.string(),
	startTime: z.string(), // Daily start time HH:mm
	endTime: z.string(), // Daily end time HH:mm
	breakTimes: z.array(breakTimeSchema),
	periods: z.array(periodInputSchema)
});

export type BreakTime = z.infer<typeof breakTimeSchema>;
export type PeriodInput = z.infer<typeof periodInputSchema>;
export type TimetableInput = z.infer<typeof timetableInputSchema>;

export interface ScheduleConflict {
	type: 'TEACHER' | 'CLASSROOM' | 'BREAK_TIME';
	details: {
		startTime: string;
		endTime: string;
		dayOfWeek: number;
		entityId: string;
	};
}

export interface AvailabilityCheck {
	isAvailable: boolean;
	conflicts: ScheduleConflict[];
}