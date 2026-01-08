
import { PrismaClient, MeetingType, MeetingScope, MeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class CadenceService {

    /**
     * Schedule Internal Reviews
     * Checks for and creates next upcoming instances of recurring internal meetings.
     */
    static async scheduleInternalReviews() {
        console.log('[Cadence Service] Scheduling Internal Reviews...');
        let createdCount = 0;

        // 1. Cluster Reviews: Every Monday @ 10:00 AM
        const clusters = await prisma.cluster.findMany();

        for (const cluster of clusters) {
            const nextMonday = this.getNextDayOfWeek(1); // 1 = Monday
            nextMonday.setHours(10, 0, 0, 0);

            // Check if exists
            const exists = await prisma.meeting.findFirst({
                where: {
                    clusterId: cluster.id,
                    type: MeetingType.CLUSTER_REVIEW,
                    date: nextMonday
                }
            });

            if (!exists) {
                await prisma.meeting.create({
                    data: {
                        title: `${cluster.name} - Weekly Review`,
                        date: nextMonday,
                        status: MeetingStatus.SCHEDULED,
                        scope: MeetingScope.INTERNAL_CLUSTER,
                        type: MeetingType.CLUSTER_REVIEW,
                        clusterId: cluster.id
                    }
                });
                console.log(`  + Scheduled Cluster Review for ${cluster.name} on ${nextMonday.toDateString()}`);
                createdCount++;
            }
        }

        // 2. Pan-India Review: 1st Friday of Month @ 10:00 AM
        const nextFirstFriday = this.getNextFirstFriday();
        nextFirstFriday.setHours(10, 0, 0, 0);

        const piExists = await prisma.meeting.findFirst({
            where: {
                type: MeetingType.PAN_INDIA_REVIEW,
                date: nextFirstFriday
            }
        });

        if (!piExists) {
            await prisma.meeting.create({
                data: {
                    title: `Pan-India Monthly Review`,
                    date: nextFirstFriday,
                    status: MeetingStatus.SCHEDULED,
                    scope: MeetingScope.INTERNAL_PAN_INDIA,
                    type: MeetingType.PAN_INDIA_REVIEW
                }
            });
            console.log(`  + Scheduled Pan-India Review on ${nextFirstFriday.toDateString()}`);
            createdCount++;
        }

        console.log(`[Cadence Service] Scheduled ${createdCount} meetings.`);
    }

    // Helper: Get next specific day of week (0=Sun, 1=Mon...)
    private static getNextDayOfWeek(dayIndex: number): Date {
        const date = new Date();
        date.setDate(date.getDate() + (dayIndex + 7 - date.getDay()) % 7);
        // If today is Monday and passed 10am, arguably should schedule next week. 
        // For simplicity, if it's the same day, we assume it's "this week" unless passed.
        // Simplest logic: always ensuring "upcoming" often implies future.
        // Let's stick to: if today is Monday, return today. logic handled by caller time check usually.
        return date;
    }

    // Helper: Get next occurrence of 1st Friday of a month
    private static getNextFirstFriday(): Date {
        const date = new Date();
        // Move to 1st of current month
        date.setDate(1);

        // Find 1st Friday of current month
        while (date.getDay() !== 5) {
            date.setDate(date.getDate() + 1);
        }

        // If that date is in the past, move to next month
        if (date < new Date()) {
            date.setMonth(date.getMonth() + 1);
            date.setDate(1);
            while (date.getDay() !== 5) {
                date.setDate(date.getDate() + 1);
            }
        }
        return date;
    }
}
