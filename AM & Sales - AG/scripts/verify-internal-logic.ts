
import { PrismaClient, MeetingType, MeetingScope } from '@prisma/client';
import { MeetingService } from '../src/services/meeting-service';
import { CadenceService } from '../src/services/cadence-service';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification: Internal Meeting Logic ---');

    console.log('1. Testing Auto-Invite Logic...');

    // Test Cluster Review Attendees (North Cluster)
    const northCluster = await prisma.cluster.findFirst({ where: { region: 'North' } });
    if (northCluster) {
        console.log(`Checking attendees for Cluster Review (${northCluster.name})...`);
        const attendees = await MeetingService.getDefaultAttendees(
            MeetingType.CLUSTER_REVIEW,
            MeetingScope.INTERNAL_CLUSTER,
            northCluster.id
        );
        console.log(`  - Found ${attendees.length} attendees.`);
    } else {
        console.warn('  ! North Cluster not found. Did you run seed-internal.ts?');
    }

    // Test Pan-India Attendees
    console.log(`Checking attendees for Pan-India Review...`);
    const panIndiaAttendees = await MeetingService.getDefaultAttendees(
        MeetingType.PAN_INDIA_REVIEW,
        MeetingScope.INTERNAL_PAN_INDIA
    );
    console.log(`  - Found ${panIndiaAttendees.length} attendees (Admins/Cluster Leads).`);

    console.log('2. Testing Cadence Scheduling...');
    await CadenceService.scheduleInternalReviews();

    // Verify Meetings Created
    const meetings = await prisma.meeting.findMany({
        where: {
            scope: { in: [MeetingScope.INTERNAL_CLUSTER, MeetingScope.INTERNAL_PAN_INDIA] }
        },
        include: { cluster: true }
    });

    console.log(`Total Internal Meetings scheduled: ${meetings.length}`);
    meetings.forEach(m => {
        console.log(`  - [${m.scope}] ${m.title} @ ${m.date.toDateString()}`);
    });

    console.log('--- Verification Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
