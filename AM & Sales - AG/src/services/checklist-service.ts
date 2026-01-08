import { PrismaClient, VisitCadence, ChecklistStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ChecklistService {
    /**
     * Trigger Daily Walkthroughs
     * Finds all AMs with "Daily" cadence clients and creates a blank ChecklistSubmission for today.
     */
    static async triggerDailyWalkthroughs() {
        console.log('[Checklist Engine] Triggering Daily Walkthrough generation...');

        // 1. Find the "Daily Walkthrough" template
        // In a real app, this might be a constant ID or strictly named config
        const template = await prisma.checklistTemplate.findFirst({
            where: { name: 'Daily Walkthrough' }
        });

        if (!template) {
            console.error('[Checklist Engine] Error: "Daily Walkthrough" template not found. Please seed it.');
            return;
        }

        // 2. Find all Clients with VisitCadence = DAILY
        const dailyClients = await prisma.client.findMany({
            where: {
                visitCadence: VisitCadence.DAILY
            },
            include: {
                team: {
                    include: { user: true }
                }
            }
        });

        console.log(`[Checklist Engine] Found ${dailyClients.length} clients with DAILY cadence.`);

        let createdCount = 0;

        // 3. For each client, find the AM and create a submission
        for (const client of dailyClients) {
            // Find the AM in the team
            const amMember = client.team.find(t => t.user.role === 'AM');

            if (!amMember) {
                console.warn(`[Checklist Engine] Warning: Client ${client.name} has no assigned AM. Skipping.`);
                continue;
            }

            // Check if submission already exists for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existing = await prisma.checklistSubmission.findFirst({
                where: {
                    clientId: client.id,
                    templateId: template.id,
                    date: {
                        gte: today
                    }
                }
            });

            if (existing) {
                // Already created for today
                continue;
            }

            // Create blank submission
            await prisma.checklistSubmission.create({
                data: {
                    templateId: template.id,
                    userId: amMember.userId,
                    clientId: client.id,
                    date: new Date(), // Now
                    status: ChecklistStatus.PENDING,
                    data: {} // Blank
                }
            });

            createdCount++;
        }

        console.log(`[Checklist Engine] Successfully created ${createdCount} Daily Walkthrough submissions.`);
    }
}
