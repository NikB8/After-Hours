import { PrismaClient, MeetingStatus, ActionCategory, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class SettlementService {

    static getDepartmentForCategory(category: ActionCategory): string {
        switch (category) {
            case ActionCategory.IT:
                return "IT_DEPT";
            case ActionCategory.MAINTENANCE:
                return "PROJECTS_DEPT";
            case ActionCategory.OPS:
                return "OPERATIONS_DEPT";
            default:
                return "GENERAL";
        }
    }

    static async attemptMeetingSettlement(meetingId: string) {
        // 1. Fetch all ActionItems for the meeting with their Tickets
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: {
                actionItems: {
                    include: { ticket: true }
                }
            }
        });

        if (!meeting) throw new Error("Meeting not found");

        // 2. Check for open tickets
        // 2. Check for open tickets
        // Filter out items that are strictly blocking settlement:
        // - Must NOT be internal (Internal actions don't block external meetings)
        // - Must have a ticket (If no ticket, likely legacy or error, but technically doesn't block)
        const openTickets = meeting.actionItems.filter(item => {
            if (item.isInternal) return false; // Internal tasks don't block

            // If there is a ticket, it must be CLOSED to settle
            return item.ticket && item.ticket.status !== TicketStatus.CLOSED;
        });

        if (openTickets.length > 0) {
            const ticketIds = openTickets.map(i => i.ticket?.externalTicketId || i.ticket?.id).join(', ');
            throw new Error(`Cannot Settle Meeting. Open Tickets exist: ${ticketIds}`);
        }

        // 3. Mark as Settled
        await prisma.meeting.update({
            where: { id: meetingId },
            data: { status: MeetingStatus.SETTLED }
        });

        return { success: true, message: "Meeting Settled Successfully" };
    }
}
