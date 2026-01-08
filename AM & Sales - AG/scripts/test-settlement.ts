import { PrismaClient, ClientCategory, MeetingStatus, ActionPriority, ActionCategory, TicketStatus } from '@prisma/client';
import { SettlementService } from '../src/services/settlement-service';

const prisma = new PrismaClient();

async function main() {
    console.log("TEST: Starting Settlement Logic Test...");

    // 1. Create a Client
    const client = await prisma.client.create({
        data: {
            name: `Test Client Settl-${Date.now()}`,
            crm_id: `SETTL-${Date.now()}`,
            region: "West",
            category: ClientCategory.CAT_B
        }
    });
    console.log(`TEST: Created Client ${client.id}`);

    // 2. Create a Meeting
    const meeting = await prisma.meeting.create({
        data: {
            title: "Monthly Review",
            date: new Date(),
            clientId: client.id,
            status: MeetingStatus.COMPLETED
        }
    });
    console.log(`TEST: Created Meeting ${meeting.id}`);

    // 3. Create Action Item and Open Ticket
    const actionItem = await prisma.actionItem.create({
        data: {
            description: "Fix Projector",
            priority: ActionPriority.HIGH,
            category: ActionCategory.IT,
            meetingId: meeting.id
        }
    });

    const ticket = await prisma.ticket.create({
        data: {
            status: TicketStatus.OPEN,
            department: SettlementService.getDepartmentForCategory(ActionCategory.IT),
            actionItemId: actionItem.id,
            externalTicketId: "JIRA-101"
        }
    });
    console.log(`TEST: Created ActionItem ${actionItem.id} with Ticket ${ticket.id} (OPEN)`);

    // 4. Attempt Settlement (Should Fail)
    console.log("TEST: Attempting Settlement (Expected Failure)...");
    try {
        await SettlementService.attemptMeetingSettlement(meeting.id);
        console.error("TEST: FAILED - Settlement should have been blocked!");
        process.exit(1);
    } catch (e: any) {
        console.log(`TEST: SUCCESS - Blocked as expected: ${e.message}`);
    }

    // 5. Close Ticket
    await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.CLOSED }
    });
    console.log("TEST: Closed Ticket");

    // 6. Attempt Settlement (Should Success)
    console.log("TEST: Attempting Settlement (Expected Success)...");
    try {
        const result = await SettlementService.attemptMeetingSettlement(meeting.id);
        console.log(`TEST: SUCCESS - ${result.message}`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
