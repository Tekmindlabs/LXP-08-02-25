import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { AttendanceStatus } from "@/types/attendance";

export const attendanceRouter = createTRPCRouter({
    updateAttendance: protectedProcedure
        .input(z.object({
            studentId: z.string(),
            status: z.nativeEnum(AttendanceStatus),
            date: z.date(),
            notes: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.attendance.upsert({
                where: {
                    studentId_date: {
                        studentId: input.studentId,
                        date: input.date
                    }
                },
                update: {
                    status: input.status,
                    notes: input.notes
                },
                create: {
                    studentId: input.studentId,
                    status: input.status,
                    date: input.date,
                    notes: input.notes
                }
            });
        }),

    getAttendanceStats: protectedProcedure
        .input(z.object({
            date: z.date()
        }))
        .query(async ({ ctx, input }) => {
            const attendanceRecords = await ctx.prisma.attendance.findMany({
                where: {
                    date: input.date
                }
            });

            const total = await ctx.prisma.student.count();
            const stats = attendanceRecords.reduce((acc, record) => {
                acc[record.status.toLowerCase() as keyof typeof acc]++;
                return acc;
            }, {
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                total
            });

            return stats;
        }),

    getAttendanceTrend: protectedProcedure
        .input(z.object({
            date: z.date()
        }))
        .query(async ({ ctx, input }) => {
            const startDate = new Date(input.date);
            startDate.setDate(startDate.getDate() - 7);

            const attendanceRecords = await ctx.prisma.attendance.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: input.date
                    }
                }
            });

            const total = await ctx.prisma.student.count();
            const trendByDate = new Map();

            attendanceRecords.forEach(record => {
                const dateStr = record.date.toISOString().split('T')[0];
                if (!trendByDate.has(dateStr)) {
                    trendByDate.set(dateStr, {
                        present: 0,
                        absent: 0,
                        late: 0,
                        excused: 0,
                        total
                    });
                }
                const stats = trendByDate.get(dateStr);
                stats[record.status.toLowerCase()]++;
            });

            return Array.from(trendByDate.entries()).map(([date, stats]) => ({
                date,
                stats
            }));
        })
});
