
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Settlement Logic Fix ---");

    // 1. Create a fresh user & event to test "Organizer Only" settlement
    const userEmail = `organizer_${Date.now()}@test.com`;
    const user = await prisma.user.create({
        data: {
            email: userEmail,
            name: "Settlement Tester",
            password: "hashed_dummy"
        }
    });

    // Create Event
    const event = await prisma.event.create({
        data: {
            organizer_id: user.id,
            sport: 'Tennis',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            venue_name: 'Court 1',
            map_link: 'http://maps.google.com',
            max_players: 2,
            estimated_cost: 100,
            status: 'Open'
        }
    });

    // Add Organizer as Participant (Status: Organizer)
    await prisma.participant.create({
        data: {
            event_id: event.id,
            user_id: user.id,
            status: 'Organizer',
            is_paid: true,
            payment_status: 'Paid'
        }
    });

    console.log(`Created Event ${event.id} with Organizer ${user.email}`);

    // 2. Attempt Settlement via API
    // We'll use fetch to hit the API, effectively testing the route we just fixed.
    const settleUrl = `http://localhost:3000/api/v1/events/${event.id}/settle_final`;
    console.log(`Attempting settlement at ${settleUrl}...`);

    try {
        const response = await fetch(settleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_email: userEmail,
                total_cost_final: 100
            })
        });

        const data = await response.json();
        console.log(`Response Status: ${response.status}`);
        console.log('Response Body:', data);

        if (response.ok && data.participant_count >= 1) {
            console.log("SUCCESS: Settlement succeeded with Organizer included!");
        } else {
            console.error("FAILURE: Settlement failed or count incorrect.");
            process.exit(1);
        }

    } catch (e) {
        console.error("Fetch Error:", e);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
