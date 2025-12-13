
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceState() {
    console.log('Forcing Event State...');
    const event = await prisma.event.findFirst({
        where: { organizer: { email: 'nikhil@example.com' } }
    });

    if (!event) throw new Error('No event found');

    // Reset participant status to ensure we can test the "Pay" flow
    const user = await prisma.user.findFirst({ where: { email: 'nikhil@example.com' } });
    await prisma.participant.updateMany({
        where: { event_id: event.id, user_id: user.id },
        data: {
            status: 'Confirmed', // Must be confirmed to see Pay button
            is_paid: false,
            payment_status: 'Unpaid',
            amount_due: 50 // Ensure there is an amount due
        }
    });

    // Force event to Completed and Settled
    await prisma.event.update({
        where: { id: event.id },
        data: {
            status: 'Completed',
            total_cost_final: 500,
            is_settled: false
        }
    });
    console.log('Event forced to Completed with existing debt.');
}

forceState()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
