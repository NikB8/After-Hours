const { PrismaClient: PrismaClientRef } = require('@prisma/client');
const prismaRef = new PrismaClientRef();

async function main() {
    console.log("--- Testing Referral Flow ---");

    // 1. Create Event
    const organizerEmail = `org_ref_${Date.now()}@test.com`;
    const userA = await prismaRef.user.create({ data: { email: organizerEmail, name: "Referrer Roy" } });

    const event = await prismaRef.event.create({
        data: {
            organizer_id: userA.id,
            sport: 'Badminton',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            venue_name: 'Smash Arena',
            map_link: 'http://smash.map',
            max_players: 4,
            estimated_cost: 0,
            status: 'Open'
        }
    });

    console.log(`Event Created: ${event.id}`);
    console.log(`Referrer: ${userA.id} (${userA.name})`);

    // 2. Add Referrer as Participant (optional, but realistic)
    await prismaRef.participant.create({ data: { event_id: event.id, user_id: userA.id, status: 'Confirmed', transport_mode: 'Independent', car_seats: 0 } });

    // 3. Invited User (User B) joins via API (Simulated direct DB call to verify Schema/Client if server is stale)
    const userB = await prismaRef.user.create({ data: { email: `userB_ref_${Date.now()}@test.com`, name: "Invited Ian" } });

    // Simulate API logic directly to verify Client/Schema availability
    console.log(`Invited User (${userB.email}) joining (Direct DB)...`);

    let participantId;
    try {
        const p = await prismaRef.participant.create({
            data: {
                event_id: event.id,
                user_id: userB.id,
                status: 'Confirmed',
                referred_by_id: userA.id
            }
        });
        participantId = p.id;
        console.log("Direct DB Create Success. Status:", p.status);
    } catch (e: any) {
        console.error("Direct DB Create Failed:", e.message);
    }

    if (!participantId) return;

    // 4. Verification
    const participantB = await prismaRef.participant.findUnique({
        where: { id: participantId },
        include: { referred_by: true }
    });

    if (participantB && participantB.referred_by_id === userA.id) {
        console.log("SUCCESS: Referral tracked correctly.");
        console.log(`Participant ${participantB.user_id} was referred by ${participantB.referred_by_id} (${participantB.referred_by?.name})`);
    } else {
        console.error("FAILURE: Referral NOT tracked.");
        console.log("Has referred_by_id:", participantB?.referred_by_id);
    }
}

main()
    .catch(console.error)
    .finally(() => prismaRef.$disconnect());
