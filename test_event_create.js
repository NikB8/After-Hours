
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateEvent() {
    console.log("Testing Event Creation...");

    // 1. Get the user we just created
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!user) {
        console.error("No users found to create event with!");
        process.exit(1);
    }
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Mock a session or skip session check???
    // The API uses `auth()`. We can't easily mock `auth()` from a script hitting localhost:3000
    // UNLESS we bypass it or use a real login flow (Headless Browser).

    // ALTERNATIVE: Use the API but we are blocked by auth() unless we have a session cookie.

    // ACTUALLY: Let's use Prisma directly to verify DB writes for Events work.
    // The API layer was already verified to return 401s.
    // We want to verify Postgres accepts the Event data structure (Dates, Decimals etc).

    try {
        const event = await prisma.event.create({
            data: {
                organizer_id: user.id,
                sport: 'Badminton',
                start_time: new Date(),
                end_time: new Date(Date.now() + 3600000), // +1 hour
                venue_name: 'Test Setup Venue',
                map_link: 'http://maps.google.com',
                max_players: 4,
                estimated_cost: 500,
                status: 'Open'
            }
        });
        console.log("Event Created Successfully in Postgres:", event.id);
    } catch (e) {
        console.error("Event Creation Failed:", e);
    }
}

testCreateEvent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
