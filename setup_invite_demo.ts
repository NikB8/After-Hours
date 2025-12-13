
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Create Event
    const organizerEmail = `demo_org_${Date.now()}@test.com`;
    const userA = await prisma.user.create({ data: { email: organizerEmail, name: "Demo Organizer" } });

    const event = await prisma.event.create({
        data: {
            organizer_id: userA.id,
            sport: 'Padel',
            start_time: new Date(Date.now() + 86400000), // Tomorrow
            end_time: new Date(Date.now() + 90000000),
            venue_name: 'Downtown Courts',
            map_link: 'http://maps.google.com',
            max_players: 4,
            estimated_cost: 20,
            status: 'Open'
        }
    });

    // 2. Output URL
    const url = `http://localhost:3000/events/invite/${event.id}?ref=${userA.id}`;
    console.log("INVITE_URL:", url);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
