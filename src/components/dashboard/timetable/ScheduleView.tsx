import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { api } from "@/utils/api";
import { TeacherProfile, Period, Classroom } from "@prisma/client";

interface ScheduleViewProps {
	type: 'teacher' | 'classroom';
	entityId: string;
	termId: string;
}

type PeriodWithRelations = Period & {
	subject: { name: string };
	teacher: TeacherProfile & { 
		user: { name: string | null } 
	};
	classroom: Classroom;
	timetable: {
		class: {
			name: string;
		};
	};
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
	const hour = Math.floor(i / 2) + 8;
	const minute = i % 2 === 0 ? "00" : "30";
	return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function ScheduleView({ type, entityId, termId }: ScheduleViewProps) {
	const [selectedDay, setSelectedDay] = useState(1);

	const { data: schedule } = type === 'teacher' 
		? api.timetable.getTeacherSchedule.useQuery({ teacherId: entityId, termId })
		: api.timetable.getClassroomSchedule.useQuery({ classroomId: entityId, termId });

	const periodsByDay = schedule?.reduce<Record<number, PeriodWithRelations[]>>((acc, period: any) => {
		const day = period.dayOfWeek;
		if (!acc[day]) acc[day] = [];
		acc[day].push({
			...period,
			subject: { name: period.subject.name },
			teacher: {
				...period.teacher,
				user: {
					name: period.teacher.user?.name ?? null
				}
			},
			classroom: period.classroom,
			timetable: {
				class: {
					name: period.timetable.class.name
				}
			}
		} as PeriodWithRelations);
		return acc;
	}, {});

	const getPeriodsForTimeSlot = (day: number, timeSlot: string) => {
		return periodsByDay?.[day]?.filter(period => {
			const periodStart = period.startTime.toISOString().slice(11, 16);
			const periodEnd = period.endTime.toISOString().slice(11, 16);
			return timeSlot >= periodStart && timeSlot < periodEnd;
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">
					{type === 'teacher' ? 'Teacher Schedule' : 'Classroom Schedule'}
				</h2>
				<Select
					value={selectedDay.toString()}
					onValueChange={(value) => setSelectedDay(parseInt(value))}
				>
					{DAYS.map((day, index) => (
						<option key={index + 1} value={index + 1}>
							{day}
						</option>
					))}
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-2">
				{TIME_SLOTS.map((timeSlot) => {
					const periods = getPeriodsForTimeSlot(selectedDay, timeSlot);
					return (
						<div key={timeSlot} className="flex">
							<div className="w-20 py-2 text-sm text-gray-500">{timeSlot}</div>
							<div className="flex-1">
								{periods?.map((period) => (
									<Card key={period.id} className="p-2 bg-primary/10">
										<div className="text-sm font-medium">
											{period.subject.name}
										</div>
										<div className="text-xs text-gray-500">
											{type === 'teacher' 
												? `Room ${period.classroom.name}`
												: `Teacher: ${period.teacher.user.name ?? 'Unknown'}`}
										</div>
										<div className="text-xs text-gray-500">
											{period.startTime.toLocaleTimeString()} - {period.endTime.toLocaleTimeString()}
										</div>
									</Card>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}