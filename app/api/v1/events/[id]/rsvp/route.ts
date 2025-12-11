import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email } = body; // Mock auth

        if (!user_email) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
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

            if (existingParticipant) {
                // If they declined before, we can let them re-join
                if (existingParticipant.status === 'Declined') {
                    // proceed to update
                } else {
                    return existingParticipant; // Already joined or waitlisted
                }
            }

            // 3. Determine status
            const confirmedCount = event.participants.length;
            const newStatus = confirmedCount < event.max_players ? 'Confirmed' : 'Waitlist';

            // 4. Create or Update participant
            if (existingParticipant) {
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
