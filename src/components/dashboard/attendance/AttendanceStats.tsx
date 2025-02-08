import { Card } from '@/components/ui/card';
import { AttendanceStats as AttendanceStatsType } from '@/types/attendance';

interface AttendanceStatsProps {
	stats: AttendanceStatsType;
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
	const { present, absent, late, excused, total } = stats;

	return (
		<Card className="p-6">
			<h2 className="text-2xl font-bold mb-4">Attendance Statistics</h2>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<p className="text-sm text-gray-500">Present</p>
					<p className="text-2xl font-bold text-green-600">{present}</p>
				</div>
				<div className="space-y-2">
					<p className="text-sm text-gray-500">Absent</p>
					<p className="text-2xl font-bold text-red-600">{absent}</p>
				</div>
				<div className="space-y-2">
					<p className="text-sm text-gray-500">Late</p>
					<p className="text-2xl font-bold text-yellow-600">{late}</p>
				</div>
				<div className="space-y-2">
					<p className="text-sm text-gray-500">Excused</p>
					<p className="text-2xl font-bold text-blue-600">{excused}</p>
				</div>
			</div>
			<div className="mt-4 pt-4 border-t">
				<div className="flex justify-between items-center">
					<p className="text-sm text-gray-500">Total Students</p>
					<p className="text-xl font-bold">{total}</p>
				</div>
				<div className="flex justify-between items-center mt-2">
					<p className="text-sm text-gray-500">Attendance Rate</p>
					<p className="text-xl font-bold text-green-600">
						{total > 0 ? Math.round((present / total) * 100) : 0}%
					</p>
				</div>
			</div>
		</Card>
	);
}
