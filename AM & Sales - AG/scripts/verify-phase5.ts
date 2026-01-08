import { PrismaClient, VisitCadence } from '@prisma/client';
import { ChecklistService } from '../src/services/checklist-service';
import { NotificationService } from '../src/services/notification-service';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Verification ---');

    console.log('1. Seeding Test Data...');

    // Cleanup previous run if exists
    const prevClient = await prisma.client.findUnique({ where: { crm_id: 'TEST-123' } });
    if (prevClient) {
        console.log('Cleaning up previous test data...');
        await prisma.client.delete({ where: { id: prevClient.id } });
    }
    const prevUser = await prisma.user.findUnique({ where: { email: 'test-am@example.com' } });
    if (prevUser) await prisma.user.delete({ where: { id: prevUser.id } });

    const prevTemplate = await prisma.checklistTemplate.findFirst({ where: { name: 'Daily Walkthrough' } });
    if (prevTemplate) await prisma.checklistTemplate.delete({ where: { id: prevTemplate.id } });


    // Create Test User (AM)
    const amUser = await prisma.user.create({
        data: {
            email: 'test-am@example.com',
            role: 'AM',
            name: 'Test AM'
        }
    });

    // Create Test Template
    const template = await prisma.checklistTemplate.create({
        data: {
            name: 'Daily Walkthrough',
            items: { check: 'Make sure everything is clean' },
            role: 'AM'
        }
    });

    // Create Test Client
    const client = await prisma.client.create({
        data: {
            name: 'Test Client',
            crm_id: 'TEST-123',
            region: 'North',
            category: 'CAT_A',
            visitCadence: VisitCadence.DAILY,
            spocEmail: 'test-spoc@example.com'
        }
    });

    // Link AM to Client
    await prisma.clientTeam.create({
        data: {
            clientId: client.id,
            userId: amUser.id,
            responsibility: 'Primary Manager'
        }
    });

    // Create Open Ticket (>48h old)
    // Need a Meeting and ActionItem first
    const meeting = await prisma.meeting.create({
        data: {
            title: 'Test Meeting',
            date: new Date(),
            clientId: client.id
        }
    });

    const actionItem = await prisma.actionItem.create({
        data: {
            description: 'Fix the AC',
            priority: 'HIGH',
            category: 'MAINTENANCE',
            meetingId: meeting.id
        }
    });

    await prisma.ticket.create({
        data: {
            status: 'OPEN',
            department: 'Maintenance',
            actionItemId: actionItem.id,
            createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000) // 50 hours ago
        }
    });

    // Assign Cluster Lead to Client for Alert
    const clUser = await prisma.user.create({
        data: {
            email: 'test-cl@example.com',
            role: 'CLUSTER_LEAD',
            name: 'Test Cluster Lead'
        }
    });
    await prisma.clientTeam.create({
        data: {
            clientId: client.id,
            userId: clUser.id,
            responsibility: 'Cluster Lead'
        }
    });


    console.log('2. Testing triggers...');

    await ChecklistService.triggerDailyWalkthroughs();
    // Check if submission exists
    const subm = await prisma.checklistSubmission.findFirst({
        where: { clientId: client.id, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });
    if (subm) console.log('✅ Checklist Submission created');
    else console.error('❌ Checklist Submission NOT created');

    await NotificationService.broadcastAMLeave(amUser.id, '2025-01-01', '2025-01-05');

    await NotificationService.checkSLABreach();

    console.log('3. Cleanup...');
    await prisma.client.delete({ where: { id: client.id } });
    await prisma.user.delete({ where: { id: amUser.id } });
    await prisma.user.delete({ where: { id: clUser.id } });
    await prisma.checklistTemplate.delete({ where: { id: template.id } });

    console.log('--- Verification Complete ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
