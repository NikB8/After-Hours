
import { PrismaClient, MeetingScope, MeetingStatus } from '@prisma/client';
import { processMeetingRecording } from '../src/functions/process-meeting-recording';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification: Context-Aware Transcription ---');

    console.log('1. Creating Mock Meetings...');
    const internalMeeting = await prisma.meeting.create({
        data: {
            title: 'Internal Cluster Q3 Review',
            date: new Date(),
            scope: MeetingScope.INTERNAL_CLUSTER,
            status: MeetingStatus.COMPLETED
        }
    });

    const clientMeeting = await prisma.meeting.create({
        data: {
            title: 'Client Alpha QBR',
            date: new Date(),
            scope: MeetingScope.CLIENT_EXTERNAL,
            status: MeetingStatus.COMPLETED
        }
    });

    console.log('2. Testing Internal Context...');
    const resultInternal = await processMeetingRecording({
        data: { meetingId: internalMeeting.id, recordingUrl: 'http://mock/internal.mp3' }
    });

    if (resultInternal.promptUsed.includes('Executive Assistant')) {
        console.log('  ✅ Internal Prompt selected correctly: "Executive Assistant"');
    } else {
        console.error('  ❌ Wrong prompt for Internal meeting!');
    }

    console.log('3. Testing External Context...');
    const resultExternal = await processMeetingRecording({
        data: { meetingId: clientMeeting.id, recordingUrl: 'http://mock/external.mp3' }
    });

    if (resultExternal.promptUsed.includes('Client Account Manager')) {
        console.log('  ✅ External Prompt selected correctly: "Client Account Manager"');
    } else {
        console.error('  ❌ Wrong prompt for External meeting!');
    }

    console.log('--- Verification Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
