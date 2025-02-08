import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/utils/api";
import { TimetableInput, timetableInputSchema } from "@/types/timetable";
import { toast } from "@/hooks/use-toast";

export function TimetableForm() {
	const form = useForm<TimetableInput>({
		resolver: zodResolver(timetableInputSchema),
		defaultValues: {
			startTime: "08:00",
			endTime: "15:00",
			breakTimes: [
				{ startTime: "10:30", endTime: "10:45", type: "SHORT_BREAK", dayOfWeek: 1 },
				{ startTime: "12:30", endTime: "13:15", type: "LUNCH_BREAK", dayOfWeek: 1 }
			],
			periods: []
		}
	});

	const { mutate: createTimetable } = api.timetable.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Timetable created successfully"
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive"
			});
		}
	});

	const onSubmit = (data: TimetableInput) => {
		createTimetable(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="startTime"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Daily Start Time</FormLabel>
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
								<FormLabel>Daily End Time</FormLabel>
								<FormControl>
									<Input type="time" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-medium">Break Times</h3>
					{form.watch("breakTimes")?.map((_, index) => (
						<div key={index} className="grid grid-cols-4 gap-4">
							<FormField
								control={form.control}
								name={`breakTimes.${index}.startTime`}
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
								name={`breakTimes.${index}.endTime`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`breakTimes.${index}.type`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<option value="SHORT_BREAK">Short Break</option>
											<option value="LUNCH_BREAK">Lunch Break</option>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`breakTimes.${index}.dayOfWeek`}
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
						</div>
					))}
				</div>

				<Button type="submit">Create Timetable</Button>
			</form>
		</Form>
	);
}