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

        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the participant record
            const participant = await tx.participant.findUnique({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: user.id,
                    },
                },
            });

            if (!participant || participant.status === 'Declined') {
                throw new Error('User is not a participant');
            }

            const wasConfirmed = participant.status === 'Confirmed';

            // 2. Update status to Declined
            await tx.participant.update({
                where: { id: participant.id },
                data: { status: 'Declined' },
            });

            // 3. Waitlist Promotion Logic
            if (wasConfirmed) {
                // Find the oldest waitlisted participant
                const nextInLine = await tx.participant.findFirst({
                    where: {
                        event_id: eventId,
                        status: 'Waitlist',
                    },
                    orderBy: {
                        createdAt: 'asc', // First come, first served
                    },
                });

                if (nextInLine) {
                    // Promote to Confirmed
                    await tx.participant.update({
                        where: { id: nextInLine.id },
                        data: { status: 'Confirmed' },
                    });
                    console.log(`Promoted user ${nextInLine.user_id} from Waitlist to Confirmed`);
                    // TODO: Send notification email here
                }
            }

            return { message: 'Successfully left the event' };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error leaving event:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
