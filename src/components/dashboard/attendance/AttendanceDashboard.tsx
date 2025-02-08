import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceInput, AttendanceStatus, AttendanceTrend } from '@/types/attendance';
import { trpc } from '@/utils/trpc';

interface AttendanceDashboardProps {
	attendanceTrend: AttendanceTrend[];
	onAttendanceUpdate: (data: AttendanceInput) => Promise<void>;
	selectedDate: Date;
}

export function AttendanceDashboard({ attendanceTrend, onAttendanceUpdate, selectedDate }: AttendanceDashboardProps) {
	const studentsQuery = trpc.student.list.useQuery();

	const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
		await onAttendanceUpdate({
			studentId,
			status,
			date: selectedDate
		});
	};

	return (
		<Card className="p-6">
			<h2 className="text-2xl font-bold mb-4">Attendance Management</h2>
			<div className="space-y-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Student Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{studentsQuery.data?.map((student) => (
							<TableRow key={student.id}>
								<TableCell>{student.name}</TableCell>
								<TableCell>
									<Select onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											{Object.values(AttendanceStatus).map((status) => (
												<SelectItem key={status} value={status}>
													{status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</TableCell>
								<TableCell>
									<Button variant="outline" size="sm" onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}>
										Mark Present
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}
