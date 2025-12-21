import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyUser, NotificationType } from '@/lib/notifications';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { action, participant_id } = body; // action: 'mark_self_paid' | 'confirm_payment' | 'reject_payment'

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch Event to check authorization
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { organizer_id: true, sport: true, start_time: true }
        });

        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        const isOrganizer = event.organizer_id === userId;
        const dateStr = new Date(event.start_time).toLocaleDateString();

        if (action === 'mark_self_paid') {
            // User marking themselves
            // Security: Ensure participant_id belongs to current user? Or just find participant by userId
            const participant = await prisma.participant.findUnique({
                where: { event_id_user_id: { event_id: eventId, user_id: userId } }
            });

            if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

            await prisma.participant.update({
                where: { id: participant.id },
                data: {
                    payment_status: 'In Review',
                    is_paid: false // Strictly false until confirmed
                }
            });

            // NOTIFICATION: Inform organizer
            await notifyUser({
                recipientId: event.organizer_id,
                type: NotificationType.PAYMENT,
                title: 'Payment marked as paid',
                message: `Payment sent: ${session.user.name || session.user.email} for ${event.sport} on ${dateStr}.`,
                url: `/events/${eventId}/manage`,
                triggerUserId: userId
            });

            return NextResponse.json({ message: 'Marked as In Review' });
        }

        if (action === 'confirm_payment') {
            if (!isOrganizer) return NextResponse.json({ error: 'Only organizer can confirm' }, { status: 403 });

            const updatedParticipant = await prisma.participant.update({
                where: { id: participant_id },
                data: {
                    payment_status: 'Paid',
                    is_paid: true
                },
                include: { user: true }
            });

            // NOTIFICATION: Inform participant
            await notifyUser({
                recipientId: updatedParticipant.user_id,
                type: NotificationType.PAYMENT,
                title: 'Payment Confirmed',
                message: `${event.sport} (${dateStr}): Payment confirmed.`,
                url: `/events/${eventId}`,
                triggerUserId: userId
            });

            // Check if ALL confirmed participants are paid -> Settle Event
            const allParticipants = await prisma.participant.findMany({
                where: { event_id: eventId, status: 'Confirmed' }
            });

            const allPaid = allParticipants.every(p => p.payment_status === 'Paid');

            if (allPaid) {
                await prisma.event.update({
                    where: { id: eventId },
                    data: {
                        financial_status: 'Settled',
                        is_settled: true
                    }
                });
            }

            return NextResponse.json({ message: 'Payment Confirmed', settled: allPaid });
        }

        if (action === 'reject_payment') {
            if (!isOrganizer) return NextResponse.json({ error: 'Only organizer can reject' }, { status: 403 });

            await prisma.participant.update({
                where: { id: participant_id },
                data: {
                    payment_status: 'Unpaid',
                    is_paid: false
                }
            });

            return NextResponse.json({ message: 'Payment Rejected' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in finance actions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
