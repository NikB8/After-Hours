
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const eventId = 'da71e667-b44a-421b-9679-8fe3335974f0';

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true }
    });

    if (!event) {
        console.error('Event not found');
        return;
    }

    // Create a new participant user
    const partEmail = `player_${Date.now()}@example.com`;
    const partUser = await prisma.user.create({
        data: {
            email: partEmail,
            name: "Player One",
            password: "hashed_pass_placeholder"
        }
    });

    console.log(`Adding player ${partUser.email} as Confirmed participant...`);

    await prisma.participant.create({
        data: {
            event_id: event.id,
            user_id: partUser.id,
            status: 'Confirmed',
            is_paid: false,
            payment_status: 'Unpaid'
        }
    });
    console.log('Success: Player added as Confirmed participant.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
