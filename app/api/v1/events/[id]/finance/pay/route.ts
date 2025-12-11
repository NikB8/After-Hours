import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Verify Organizer
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizer: true },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (event.organizer.email !== user_email) {
            return NextResponse.json({ error: 'Only the organizer can mark payments' }, { status: 403 });
        }

        let paidById = null;
        if (is_paid) {
            if (paid_by_email) {
                const payer = await prisma.user.findUnique({ where: { email: paid_by_email } });
                if (!payer) return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
                paidById = payer.id;
            } else {
                // Default to self-pay if not specified
                const participant = await prisma.participant.findUnique({ where: { id: participant_id } });
                if (participant) paidById = participant.user_id;
            }
        }

        // Update Participant
        await prisma.participant.update({
            where: { id: participant_id },
            data: {
                is_paid: Boolean(is_paid),
                paid_by_id: paidById
            },
        });

        return NextResponse.json({ message: 'Payment status updated' });
    } catch (error) {
        console.error('Error updating payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
