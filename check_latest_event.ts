
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
    const latestEvent = await prisma.event.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            organizer: true,
            club: true,
        },
    });

    if (latestEvent) {
        console.log('Latest Event Found:');
        console.log(`ID: ${latestEvent.id}`);
        console.log(`Sport: ${latestEvent.sport}`);
        console.log(`Venue: ${latestEvent.venue_name}`);
        console.log(`Date: ${latestEvent.start_time}`);
        console.log(`Organizer: ${latestEvent.organizer.email}`);
        if (latestEvent.club) {
            console.log(`Club: ${latestEvent.club.name}`);
        }
    } else {
        console.log('No events found in the database.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
