
import { PrismaClient } from '@prisma/client';

async function main() {
    const eventId = 'da71e667-b44a-421b-9679-8fe3335974f0'; // Use the same event
    const organizerEmail = 'test_1765601718253@example.com';
    const finalCost = 500; // Let's settle at $500

    console.log(`--- Step 1: Settle Final Cost at $${finalCost} ---`);
    const settleRes = await fetch(`http://localhost:3000/api/v1/events/${eventId}/settle_final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: organizerEmail,
            total_cost_final: finalCost
        })
    });

    if (!settleRes.ok) {
        console.error('Settle Failed:', await settleRes.text());
        return;
    }
    const settleData = await settleRes.json();
    console.log('Settle Success:', settleData);

    // Check amounts
    // We expect per person to be = finalCost / 1 (since only 1 confirmed user 'nikhil')
    // = 500.

    console.log(`\n--- Step 2: Mark Participant as Paid ---`);
    // Need to get the participant ID. We know nikhil is participating.
    // Let's refetch event manage to get ID
    // Use Prisma to get participant ID directly since /manage requires auth
    const prisma = new PrismaClient();
    const participant = await prisma.participant.findFirst({
        where: {
            event_id: eventId,
            status: 'Confirmed'
        },
        include: { user: true }
    });

    if (!participant) {
        console.error("No confirmed participant found via Prisma!");
        return;
    }
    await prisma.$disconnect();

    console.log(`Marking ${participant.user.email} (ID: ${participant.id}) as PAID...`);

    const payRes = await fetch(`http://localhost:3000/api/v1/events/${eventId}/finance/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_email: organizerEmail,
            participant_id: participant.id,
            is_paid: true
        })
    });

    const payData = await payRes.json();
    console.log('Payment Response:', payData);

    if (payData.is_settled) {
        console.log('SUCCESS: Event auto-settled!');
    } else {
        console.error('FAIL: Event did not auto-settle.');
    }
}

main();
