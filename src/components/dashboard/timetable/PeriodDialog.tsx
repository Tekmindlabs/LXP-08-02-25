import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/utils/api";
import { PeriodInput, periodInputSchema } from "@/types/timetable";
import { toast } from "@/hooks/use-toast";

interface PeriodDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (period: PeriodInput) => void;
	breakTimes: { startTime: string; endTime: string; dayOfWeek: number }[];
}

export function PeriodDialog({ isOpen, onClose, onSave, breakTimes }: PeriodDialogProps) {
	const form = useForm<PeriodInput>({
		resolver: zodResolver(periodInputSchema),
		defaultValues: {
			startTime: "",
			endTime: "",
			dayOfWeek: 1,
			durationInMinutes: 45
		}
	});

	const { mutateAsync: checkAvailability } = api.timetable.checkAvailability.useMutation();

	const onSubmit = async (data: PeriodInput) => {
		try {
			const availability = await checkAvailability({
				period: data,
				breakTimes
			});

			if (!availability.isAvailable) {
				const conflictMessages = availability.conflicts.map(conflict => {
					switch (conflict.type) {
						case 'TEACHER':
							return 'Teacher is not available at this time';
						case 'CLASSROOM':
							return 'Classroom is already booked';
						case 'BREAK_TIME':
							return 'Period overlaps with a break time';
						default:
							return 'Scheduling conflict detected';
					}
				});

				toast({
					title: "Scheduling Conflict",
					description: conflictMessages.join('\n'),
					variant: "destructive"
				});
				return;
			}

			onSave(data);
			onClose();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to validate schedule",
				variant: "destructive"
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Period</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="dayOfWeek"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Day</FormLabel>
									<Select
										value={field.value.toString()}
										onValueChange={(value) => field.onChange(parseInt(value))}
									>
										{[1, 2, 3, 4, 5].map((day) => (
											<option key={day} value={day}>
												{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][day - 1]}
											</option>
										))}
									</Select>
								</FormItem>
							)}
						/>

						<Button type="submit">Add Period</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}