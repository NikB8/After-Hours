'use server';

import { PrismaClient, MeetingStatus, TicketStatus, VisitCadence, ChecklistStatus } from '@prisma/client';

const prisma = new PrismaClient();

export type DashboardData = {
    portfolio: {
        id: string;
        name: string;
        category: string;
        lifecycleProgress: number; // 0-100
        region: string;
    }[];
    todaysActions: {
        meetings: {
            id: string;
            title: string;
            time: string; // HH:mm
            clientName: string;
        }[];
        checklists: {
            id: string;
            clientName: string;
            status: string;
        }[];
    };
    settlementBlockers: {
        id: string; // Meeting ID
        title: string;
        date: string;
        clientName: string;
        openTicketCount: number;
    }[];
    amName: string;
};

export async function getAMDashboardData(amId: string): Promise<DashboardData> {

    // 1. Fetch AM Details
    const amUser = await prisma.user.findUnique({
        where: { id: amId }
    });

    if (!amUser) {
        throw new Error('AM not found');
    }

    // 2. Fetch Portfolio (Assigned Clients)
    const assignments = await prisma.clientTeam.findMany({
        where: { userId: amId },
        include: {
            client: {
                include: {
                    lifecycle: true
                }
            }
        }
    });

    const portfolio = assignments.map(a => {
        const c = a.client;
        const l = c.lifecycle;

        // Calculate Lifecycle Progress
        let completedSteps = 0;
        const totalSteps = 10; // Based on the 10 fields in ClientLifecycle (excluding id, clientId, timestamps)

        if (l) {
            if (l.agreement_synopsis_received) completedSteps++;
            if (l.parking_readiness_confirmed) completedSteps++;
            if (l.kick_off_call_done) completedSteps++;
            if (l.agreement_summary_shared) completedSteps++;
            if (l.welcome_email_sent) completedSteps++;
            if (l.lobby_listing_updated) completedSteps++;
            if (l.move_in_ceremony_planned) completedSteps++;
            if (l.asset_checklist_completed) completedSteps++;
            if (l.emergency_team_confirmed) completedSteps++;
            if (l.park_plus_requirements_captured) completedSteps++;
        }

        return {
            id: c.id,
            name: c.name,
            category: c.category,
            lifecycleProgress: (completedSteps / totalSteps) * 100,
            region: c.region
        };
    });

    // 3. Today's Actions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3a. Meetings
    // Find meetings where this AM is part of the client team. 
    // Simplified: Find meetings for clients in 'assignments'
    const clientIds = assignments.map(a => a.clientId);

    const todaysMeetings = await prisma.meeting.findMany({
        where: {
            clientId: { in: clientIds },
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: { not: MeetingStatus.COMPLETED }
        },
        include: { client: true }
    });

    const meetings = todaysMeetings.map(m => ({
        id: m.id,
        title: m.title,
        time: m.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        clientName: m.client.name
    }));

    // 3b. Pending Checklists
    const pendingChecklists = await prisma.checklistSubmission.findMany({
        where: {
            userId: amId, // Directly assigned to AM
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: ChecklistStatus.PENDING
        },
        include: { client: true }
    });

    const checklists = pendingChecklists.map(c => ({
        id: c.id,
        clientName: c.client.name,
        status: c.status
    }));


    // 4. Settlement Blockers
    // Completed meetings with Open Tickets
    // Look for meetings in the past (implied by COMPLETED status) for assigned clients
    const completedMeetings = await prisma.meeting.findMany({
        where: {
            clientId: { in: clientIds },
            status: MeetingStatus.COMPLETED
        },
        include: {
            client: true,
            actionItems: {
                include: {
                    ticket: true
                }
            }
        }
    });

    const settlementBlockers = [];

    for (const m of completedMeetings) {
        const openTickets = m.actionItems.filter(ai => ai.ticket && ai.ticket.status === TicketStatus.OPEN);

        if (openTickets.length > 0) {
            settlementBlockers.push({
                id: m.id,
                title: m.title,
                date: m.date.toLocaleDateString(),
                clientName: m.client.name,
                openTicketCount: openTickets.length
            });
        }
    }

    return {
        portfolio,
        todaysActions: {
            meetings,
            checklists
        },
        settlementBlockers,
        amName: amUser.name || 'Account Manager'
    };
}
