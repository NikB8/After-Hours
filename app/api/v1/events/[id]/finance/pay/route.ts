
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email, participant_id, is_paid, paid_by_email } = body;

        if (!user_email || !participant_id || is_paid === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify Organizer logic (simulated for simplicity alongside mock auth)
        // In real world, we verify session user IS the organizer.
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizer: true },
        });

        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.organizer.email !== user_email) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Get Participant current state
        const participant = await prisma.participant.findUnique({
            where: { id: participant_id },
        });

        if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

        // Calculate impact on total_collected
        // If marking paid: +amount_due
        // If marking unpaid: -amount_due
        // Only if status changes.
        let amountChange = 0;
        const amountDue = Number(participant.amount_due);

        if (Boolean(is_paid) !== participant.is_paid) {
            if (is_paid) amountChange = amountDue;
            else amountChange = -amountDue;
        }

        // Determine Payer
        let paidById = null;
        if (is_paid) {
            if (paid_by_email) {
                const payer = await prisma.user.findUnique({ where: { email: paid_by_email } });
                paidById = payer ? payer.id : participant.user_id; // Fallback or Error? fallback for now.
            } else {
                paidById = participant.user_id;
            }
        }

        // Transaction for update + event aggregation
        const updatedEvent = await prisma.$transaction(async (tx) => {
            // Update Participant
            await tx.participant.update({
                where: { id: participant_id },
                data: {
                    is_paid: Boolean(is_paid),
                    paid_by_id: paidById
                }
            });

            // Update Event Collected Amount
            const evt = await tx.event.update({
                where: { id: eventId },
                data: {
                    total_collected: { increment: amountChange }
                }
            });

            // Check Settlement Status
            // Only auto-settle if we have a final cost set
            if (evt.total_cost_final !== null && Number(evt.total_collected) >= Number(evt.total_cost_final) - 0.01) { // tolerance for float
                return await tx.event.update({
                    where: { id: eventId },
                    data: { is_settled: true }
                });
            } else if (evt.is_settled && Number(evt.total_collected) < Number(evt.total_cost_final)) {
                // Revert settlement if amount drops?
                return await tx.event.update({
                    where: { id: eventId },
                    data: { is_settled: false }
                });
            }
            return evt;
        });

        // NOTIFICATION (Async)
        (async () => {
            if (participant && participant.user_id) {
                const message = is_paid
                    ? `Payment confirmed for ${event.sport}`
                    : `Payment marked as unpaid for ${event.sport}`;

                await notifyUser(
                    participant.user_id,
                    'Payment Update',
                    message,
                    `/events/${eventId}`, // Participant view
                    'PAYMENT',
                    event.organizer.id // Triggered by organizer
                );
            }
        })();

        return NextResponse.json({
            message: 'Payment updated',
            is_settled: updatedEvent.is_settled,
            total_collected: updatedEvent.total_collected
        });

    } catch (error) {
        console.error('Error updating payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
