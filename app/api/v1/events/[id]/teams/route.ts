import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const [{ id: eventId }, session] = await Promise.all([
            params,
            auth()
        ]);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch confirmed participants
        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: 'Confirmed'
            },
            select: {
                id: true,
                user_id: true,
                team_name: true,
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        // Basic Access Control: User must be in the list or be the Organizer
        // (For simplicity allowing any authenticated user to see teams if they know the ID, 
        // effectively assumes public/shared event visibility for participants)

        return NextResponse.json(participants);

    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email, assignments } = body; // assignments: [{ participant_id, team_name }]

        if (!user_email || !assignments || !Array.isArray(assignments)) {
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
            return NextResponse.json({ error: 'Only the organizer can manage teams' }, { status: 403 });
        }

        // Update participants in a transaction
        await prisma.$transaction(
            assignments.map((assignment: { participant_id: string; team_name: string | null }) =>
                prisma.participant.update({
                    where: { id: assignment.participant_id },
                    data: { team_name: assignment.team_name },
                })
            )
        );

        return NextResponse.json({ message: 'Teams updated successfully' });
    } catch (error) {
        console.error('Error updating teams:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
