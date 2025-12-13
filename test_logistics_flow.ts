
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Testing Logistics Flow ---");

    // 1. Create Event (Physical)
    const organizerEmail = `org_log_${Date.now()}@test.com`;
    const userA = await prisma.user.create({ data: { email: organizerEmail, name: "Logistics Org" } });

    const event = await prisma.event.create({
        data: {
            organizer_id: userA.id,
            sport: 'Tennis',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            venue_name: 'City Courts',
            map_link: 'http://citycourts.map',
            max_players: 5,
            estimated_cost: 0,
            status: 'Open'
        }
    });

    // 2. Add Confirmed Participants
    const userB = await prisma.user.create({ data: { email: `userB_log_${Date.now()}@test.com`, name: "Driver Dan" } });
    await prisma.participant.create({ data: { event_id: event.id, user_id: userB.id, status: 'Confirmed' } });

    const userC = await prisma.user.create({ data: { email: `userC_log_${Date.now()}@test.com`, name: "Rider Rick" } });
    await prisma.participant.create({ data: { event_id: event.id, user_id: userC.id, status: 'Confirmed' } });

    // 3. Test PUT /logistics (Update Transport)
    console.log("Updating transport for Driver Dan...");
    const url = `http://localhost:3000/api/v1/events/${event.id}/logistics`;

    await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: userB.email,
            transport_mode: 'Driver',
            car_seats: 3,
            pickup_location: 'Downtown'
        })
    });

    console.log("Updating transport for Rider Rick...");
    await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: userC.email,
            transport_mode: 'Rider'
        })
    });

    // 4. Test GET /logistics
    console.log("Fetching Logistics Data...");
    const res = await fetch(url);
    const data = await res.json();

    console.log("Venue:", data.venue_name);
    console.log("Map:", data.map_link);
    console.log("Drivers:", data.drivers.length, JSON.stringify(data.drivers.map((d: any) => ({ name: d.user_name, seats: d.car_seats }))));
    console.log("Riders:", data.riders.length);

    // Assertions
    if (data.venue_name === 'City Courts' && data.drivers.length === 1 && data.riders.length === 1) {
        console.log("SUCCESS: Logistics data matches.");
    } else {
        console.error("FAILURE: Data mismatch.");
    }

    // 5. Test Virtual Event Logic (Heuristic check handled in Frontend, but let's verify data structure allows checking)
    // The API returns venue_name, so frontend can check.
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
