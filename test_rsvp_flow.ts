
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Testing 3-State RSVP Flow ---");

    // 1. Create Organizer and Event
    const organizerEmail = `org_${Date.now()}@test.com`;
    const userA = await prisma.user.create({ data: { email: organizerEmail, name: "Organizer A" } });

    const event = await prisma.event.create({
        data: {
            organizer_id: userA.id,
            sport: 'Padel',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            venue_name: 'Padel Center',
            map_link: 'http://maps',
            max_players: 2,
            estimated_cost: 0,
            status: 'Open'
        }
    });
    console.log(`Event Created: ${event.id}`);

    // 2. Create Users for RSVP
    const userB = await prisma.user.create({ data: { email: `userB_${Date.now()}@test.com`, name: "User Maybe" } });
    const userC = await prisma.user.create({ data: { email: `userC_${Date.now()}@test.com`, name: "User Confirm" } });
    const userD = await prisma.user.create({ data: { email: `userD_${Date.now()}@test.com`, name: "User Decline" } });

    // 3. Helper to hit RSVP API
    const rsvp = async (userEmail: string, status: string) => {
        const url = `http://localhost:3000/api/v1/events/${event.id}/rsvp`;
        console.log(`\n${userEmail} RSVP -> ${status}`);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: userEmail, status })
        });
        const data = await res.json();
        console.log("Response:", data.status);
        return data;
    };

    // 4. Run RSVPs
    await rsvp(userB.email, 'Maybe');     // Should be Maybe
    await rsvp(userC.email, 'Confirmed'); // Should be Confirmed
    await rsvp(userD.email, 'Declined');  // Should be Declined

    // 5. Test Max Capacity Logic (Max 2)
    // Currently 1 confirmed (User C). Organizer is usually NOT auto-added as participant in this mock unless logic does it.
    // Let's check if Organizer counts? The 'create' logic usually adds them.
    // In our manual test setup via Prisma raw create above, we didn't add Organizer as participant.
    // So Confirmed count = 1.

    // Add another confirmed user
    const userE = await prisma.user.create({ data: { email: `userE_${Date.now()}@test.com`, name: "User Late" } });
    await rsvp(userE.email, 'Confirmed'); // Should be Confirmed (Count 2)

    // Try to add one more
    const userF = await prisma.user.create({ data: { email: `userF_${Date.now()}@test.com`, name: "User Waitlist" } });
    await rsvp(userF.email, 'Confirmed'); // Should be Waitlist (Max reached)

    // 6. Verify Creator View API
    console.log("\n--- Verifying Creator View Responses ---");
    const responseUrl = `http://localhost:3000/api/v1/events/${event.id}/responses`;
    const resResp = await fetch(responseUrl);
    const viewData = await resResp.json();

    console.log("Counts:", JSON.stringify(viewData.counts, null, 2));

    // Assertions
    const { counts } = viewData;
    if (
        counts.Maybe === 1 &&
        counts.Confirmed === 2 &&
        counts.Declined === 1 &&
        counts.Waitlist === 1
    ) {
        console.log("SUCCESS: All counts match expected values.");
    } else {
        console.error("FAILURE: Counts do not match.");
        console.log("Expected: Maybe 1, Confirmed 2, Declined 1, Waitlist 1");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
