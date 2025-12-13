
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch'); // Assuming node env or standard fetch availability

async function testPaymentFlow() {
    console.log('--- Starting Payment Flow Test ---');

    // 1. Setup: Get Event and User
    const event = await prisma.event.findFirst({
        where: { organizer: { email: 'nikhil@example.com' } },
        include: { participants: true }
    });
    if (!event) throw new Error('No event found');
    console.log(`Event ID: ${event.id}`);

    const user = await prisma.user.findFirst({ where: { email: 'nikhil@example.com' } });

    // 2. Reset Status
    await prisma.participant.updateMany({
        where: { event_id: event.id, user_id: user.id },
        data: { is_paid: false, payment_status: 'Unpaid' }
    });
    console.log('Reset participant status to Unpaid');

    // 3. Settle Event (Backend Simulation)
    // Ensure final cost is set so status is 'Completed'ish (or use logic)
    // Actually our API logic requires event.status to be 'Completed' for Pay Now button?
    // Let's force event status to Completed
    await prisma.event.update({
        where: { id: event.id },
        data: { status: 'Completed', total_cost_final: 500 }
    });
    console.log('Event marked Completed & Settled');

    // 4. Participant Check (Simulate Frontend Fetch)
    const meRes = await fetch(`http://localhost:3000/api/v1/events/${event.id}/participant/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: 'nikhil@example.com' })
    });
    const meData = await meRes.json();
    console.log('Participant Data:', meData);

    if (meData.amount_due > 0 && meData.payment_status === 'Unpaid') {
        console.log('Verification: Amount Due is correct.');
    } else {
        console.error('Verification Failed: Amount Due missing or status wrong.');
    }

    // 5. Fetch UPI
    const upiRes = await fetch(`http://localhost:3000/api/v1/events/${event.id}/organizer_upi`);
    const upiData = await upiRes.json();
    console.log('UPI Data:', upiData);
    if (upiData.upi_id === 'nikhil@upi_mock') console.log('Verification: UPI ID correct');

    // 6. Notify Payment
    const notifyRes = await fetch(`http://localhost:3000/api/v1/events/${event.id}/participant/notify_payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: 'nikhil@example.com' })
    });
    const notifyData = await notifyRes.json();
    console.log('Notify Response:', notifyData);

    // 7. Verify Final DB State
    const finalPart = await prisma.participant.findFirst({
        where: { event_id: event.id, user_id: user.id }
    });
    console.log('Final DB Status:', finalPart.payment_status);

    if (finalPart.payment_status === 'Pending_Confirmation') {
        console.log('SUCCESS: Flow Verified');
    } else {
        console.error('FAILURE: Status not updated');
    }
}

testPaymentFlow()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
