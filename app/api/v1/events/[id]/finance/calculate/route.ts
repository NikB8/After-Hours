import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email, actual_cost } = body;

        if (!user_email || actual_cost === undefined) {
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
            return NextResponse.json({ error: 'Only the organizer can calculate costs' }, { status: 403 });
        }

        // Get confirmed participants (excluding organizer if they are not a participant, but usually they are)
        // Assuming organizer is also a participant if they joined.
        // We split cost among all CONFIRMED participants.
        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: { in: ['Confirmed', 'Organizer'] }
            },
        });

        if (participants.length === 0) {
            return NextResponse.json({ error: 'No confirmed participants to split cost' }, { status: 400 });
        }

        const costPerPerson = Number(actual_cost) / participants.length;

        // Update Event and Participants
        await prisma.$transaction([
            prisma.event.update({
                where: { id: eventId },
                data: { actual_cost: Number(actual_cost) },
            }),
            prisma.participant.updateMany({
                where: {
                    event_id: eventId,
                    status: { in: ['Confirmed', 'Organizer'] },
                },
                data: { amount_due: costPerPerson },
            }),
        ]);

        return NextResponse.json({
            message: 'Cost calculated and split successfully',
            costPerPerson,
            participantCount: participants.length
        });
    } catch (error) {
        console.error('Error calculating finance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
