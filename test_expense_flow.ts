import { PrismaClient } from '@prisma/client';
const prismaExp = new PrismaClient();

async function main() {
    console.log("--- Testing Expense Flow ---");

    // 1. Create Completed Event with Cost
    const organizerEmail = `org_exp_${Date.now()}@test.com`;
    const userA = await prismaExp.user.create({ data: { email: organizerEmail, name: "Expense Org" } });

    const event = await prismaExp.event.create({
        data: {
            organizer_id: userA.id,
            sport: 'Bowling',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            venue_name: 'Metro Bowl',
            map_link: 'http://bowl.map',
            max_players: 5,
            status: 'Completed',
            total_cost_final: 100.00,
            total_collected: 50.00, // Initially
            estimated_cost: 100.00 // Required field
        }
    });

    console.log(`Event Created: ${event.id}`);

    // 2. Add Participants
    // User B: Confirm & Paid (50)
    const userB = await prismaExp.user.create({ data: { email: `userB_exp_${Date.now()}@test.com`, name: "Paid Patty" } });
    await prismaExp.participant.create({
        data: {
            event_id: event.id,
            user_id: userB.id,
            status: 'Confirmed',
            is_paid: true,
            amount_due: 50.00
        }
    });

    // User C: Confirmed & Unpaid (50)
    const userC = await prismaExp.user.create({ data: { email: `userC_exp_${Date.now()}@test.com`, name: "Unpaid Ursula" } });
    await prismaExp.participant.create({
        data: {
            event_id: event.id,
            user_id: userC.id,
            status: 'Confirmed',
            is_paid: false,
            amount_due: 50.00
        }
    });

    // 3. Test API as User B (Patty)
    console.log("Fetching Finance as Paid Patty...");
    const url = `http://localhost:3000/api/v1/events/${event.id}/member_finance?user_email=${userB.email}`;

    let res = await fetch(url);
    let data = await res.json();

    console.log("Initial - Total Outstanding:", data.total_outcome_outstanding);
    console.log("Initial - Participants:", JSON.stringify(data.participants.map((p: any) => ({ name: p.user_name, paid: p.is_paid }))));

    if (data.total_outcome_outstanding === 50 && data.participants.find((p: any) => p.user_name === "Unpaid Ursula").is_paid === false) {
        console.log("SUCCESS: Initial state correct.");
    } else {
        console.error("FAILURE: Initial state mismatch.");
    }

    // 4. Update Ursula to Paid
    console.log("Updating Ursula to Paid...");
    await prismaExp.participant.update({
        where: { event_id_user_id: { event_id: event.id, user_id: userC.id } },
        data: { is_paid: true }
    });
    // Update event collected count too (simulating business logic)
    await prismaExp.event.update({
        where: { id: event.id },
        data: { total_collected: 100.00 }
    });

    // 5. Test API again (Simulate polling)
    console.log("Fetching Finance Again...");
    res = await fetch(url);
    data = await res.json();

    console.log("Updated - Total Outstanding:", data.total_outcome_outstanding);

    if (data.total_outcome_outstanding === 0 && data.participants.find((p: any) => p.user_name === "Unpaid Ursula").is_paid === true) {
        console.log("SUCCESS: Real-time update verified.");
    } else {
        console.error("FAILURE: Update mismatch.");
    }
}

main()
    .catch(console.error)
    .finally(() => prismaExp.$disconnect());
