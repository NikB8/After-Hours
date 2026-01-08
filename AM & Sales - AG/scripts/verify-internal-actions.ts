
import { PrismaClient, ActionPriority, ActionCategory, MeetingStatus } from '@prisma/client';
import { ActionRouter } from '../src/services/action-router';
import { SettlementService } from '../src/services/settlement-service';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification: Internal Action Routing & Settlement ---');

    console.log('0. Setup: Creating Mock Meeting...');
    // Create a dummy internal meeting
    const meeting = await prisma.meeting.create({
        data: {
            title: 'Internal Ops Sync',
            date: new Date(),
            status: MeetingStatus.COMPLETED
        }
    });

    console.log('1. Testing Internal Action (Expect No Ticket)...');
    const internalAction = await ActionRouter.createAction({
        description: 'Update HR Policies',
        priority: ActionPriority.MEDIUM,
        category: ActionCategory.HR,
        meetingId: meeting.id,
        isInternal: true
    });

    const ticketInternal = await prisma.ticket.findFirst({ where: { actionItemId: internalAction.id } });
    if (ticketInternal) {
        throw new Error('FAILED: Internal Action created a Ticket!');
    }
    console.log('  ✅ Internal Action created without ticket.');

    console.log('2. Testing External Action (Expect Ticket)...');
    const externalAction = await ActionRouter.createAction({
        description: 'Fix Broken Laptop',
        priority: ActionPriority.HIGH,
        category: ActionCategory.IT,
        meetingId: meeting.id,
        isInternal: false
    });

    const ticketExternal = await prisma.ticket.findFirst({ where: { actionItemId: externalAction.id } });
    if (!ticketExternal) {
        throw new Error('FAILED: External Action DID NOT create a Ticket!');
    }
    console.log(`  ✅ External Action created Ticket: ${ticketExternal.externalTicketId}`);

    console.log('3. Testing Settlement Logic (Should fail due to Open Ticket)...');
    try {
        await SettlementService.attemptMeetingSettlement(meeting.id);
        console.error('  ❌ Settlement succeeded unexpectedly!');
    } catch (error: any) {
        if (error.message.includes('Open Tickets exist')) {
            console.log('  ✅ Settlement correctly blocked by Open Ticket.');
        } else {
            console.error('  ❌ Settlement failed with unexpected error:', error);
        }
    }

    console.log('--- Verification Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
