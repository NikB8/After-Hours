
import { PrismaClient, VisitCadence, UserRole, MeetingStatus, TicketStatus, ChecklistStatus } from '@prisma/client';
import { getAMDashboardData } from '../src/actions/dashboard';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Verification Phase 6 ---');

    // 1. Setup Mock Data
    console.log('Seeding Data...');

    // Cleanup
    await prisma.ticket.deleteMany();
    await prisma.actionItem.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.checklistSubmission.deleteMany();
    await prisma.clientTeam.deleteMany();
    await prisma.clientLifecycle.deleteMany(); // Cascade delete usually handles this but being safe
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    // Create AM
    const am = await prisma.user.create({
        data: {
            email: 'am-dash@example.com',
            name: 'Dashboard AM',
            role: UserRole.AM
        }
    });

    // Create Client A (Good Progress)
    const clientA = await prisma.client.create({
        data: {
            name: 'Client Alpha',
            crm_id: 'C-001',
            region: 'North',
            category: 'CAT_A',
            visitCadence: VisitCadence.DAILY,
            team: {
                create: { userId: am.id, responsibility: 'Lead' }
            },
            lifecycle: {
                create: {
                    agreement_synopsis_received: new Date(),
                    parking_readiness_confirmed: new Date(),
                    kick_off_call_done: new Date(),
                    welcome_email_sent: new Date()
                    // 4/10 steps = 40%
                }
            }
        }
    });

    // Create Client B (Zero Progress)
    const clientB = await prisma.client.create({
        data: {
            name: 'Client Beta',
            crm_id: 'C-002',
            region: 'South',
            category: 'CAT_B',
            team: {
                create: { userId: am.id, responsibility: 'Support' }
            }
        }
    });

    // Today's Meeting (Incomplete)
    await prisma.meeting.create({
        data: {
            title: 'Morning Sync',
            clientId: clientA.id,
            date: new Date(), // Today
            status: MeetingStatus.SCHEDULED
        }
    });

    // Completed Meeting with Open Ticket (Blocker)
    const badMeeting = await prisma.meeting.create({
        data: {
            title: 'Settlement Discussion',
            clientId: clientB.id,
            date: new Date(Date.now() - 86400000), // Yesterday
            status: MeetingStatus.COMPLETED
        }
    });

    const ai = await prisma.actionItem.create({
        data: {
            meetingId: badMeeting.id,
            description: 'Disputed Invoice',
            priority: 'HIGH',
            category: 'OPS'
        }
    });

    await prisma.ticket.create({
        data: {
            actionItemId: ai.id,
            status: TicketStatus.OPEN,
            department: 'Operations'
        }
    });

    // 2. Fetch Dashboard Data
    console.log('Fetching Dashboard Data...');
    const data = await getAMDashboardData(am.id);

    console.log('--- Dashboard Data ---');
    console.log('AM Name:', data.amName);
    console.log('Portfolio Count:', data.portfolio.length);
    console.log('First Client Progress:', data.portfolio.find(c => c.name === 'Client Alpha')?.lifecycleProgress + '%');

    console.log("Today's Meetings:", data.todaysActions.meetings.length);
    if (data.todaysActions.meetings.length > 0) {
        console.log(' - Meeting:', data.todaysActions.meetings[0].title);
    }

    console.log('Settlement Blockers:', data.settlementBlockers.length);
    if (data.settlementBlockers.length > 0) {
        console.log(' - Blocker:', data.settlementBlockers[0].title, `(${data.settlementBlockers[0].openTicketCount} tickets)`);
    }

    // Assertions
    if (data.portfolio.length !== 2) throw new Error('Expected 2 clients');
    if (data.todaysActions.meetings.length !== 1) throw new Error('Expected 1 meeting today');
    if (data.settlementBlockers.length !== 1) throw new Error('Expected 1 settlement blocker');

    console.log('✅ Verification Successful');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
