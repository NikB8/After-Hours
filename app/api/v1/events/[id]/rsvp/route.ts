import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email, status, referred_by_id } = body; // Mock auth

        if (!user_email) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        const validStatuses = ['Confirmed', 'Declined', 'Maybe'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Mock auth: find user
        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get event details and current participant count
            const event = await tx.event.findUnique({
                where: { id: eventId },
                include: {
                    participants: {
                        where: { status: 'Confirmed' },
                    },
                },
            });

            if (!event) {
                throw new Error('Event not found');
            }

            // 2. Check if user is already a participant
            const existingParticipant = await tx.participant.findUnique({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: user.id,
                    },
                },
            });

            // 3. Determine new status
            let newStatus = status;

            // If no explicit status provided, default to toggling logic (legacy support or simple join)
            if (!newStatus) {
                // If they are already joined/waitlisted, assume no change needed or error?
                // Let's assume this endpoint is now STRICTLY for setting status if 'status' field is passed.
                // If 'status' is NOT passed, fall back to "Join" behavior -> Confirmed/Waitlist
                const confirmedCount = event.participants.length;
                newStatus = confirmedCount < event.max_players ? 'Confirmed' : 'Waitlist';
            } else if (newStatus === 'Confirmed') {
                // Check capacity only if upgrading to Confirmed
                const isAlreadyConfirmed = existingParticipant && existingParticipant.status === 'Confirmed';
                if (!isAlreadyConfirmed) {
                    const confirmedCount = event.participants.length;
                    if (confirmedCount >= event.max_players) {
                        newStatus = 'Waitlist';
                    }
                }
            }
            // 'Maybe' and 'Declined' always allowed (no capacity check)

            // 4. Create or Update participant
            if (existingParticipant) {
                // We typically don't update referrer if they already exist, only on creation.
                return await tx.participant.update({
                    where: { id: existingParticipant.id },
                    data: { status: newStatus },
                });
            } else {
                return await tx.participant.create({
                    data: {
                        event_id: eventId,
                        user_id: user.id,
                        status: newStatus,
                        referred_by_id: referred_by_id || null
                    },
                });
            }
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error processing RSVP:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
