import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        email: true,
                    },
                },
                participants: true,
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // 1. Authenticate User
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Requesting User to check permissions
        const requestingUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!requestingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Fetch Existing Event
        const existingEvent = await prisma.event.findUnique({
            where: { id },
            // include: { organizer: true } // Not needed if we check organizer_id directly
        });

        if (!existingEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 4. Authorization Check: requester must be the organizer OR an admin
        // Use ID comparison (Reliable) instead of Email (Case-sensitive/mutable)
        const isOrganizer = existingEvent.organizer_id === session.user.id;

        // @ts-ignore
        const isAdmin = session.user.is_super_admin || false;

        if (!isOrganizer && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Only the organizer or an admin can edit this event' }, { status: 403 });
        }

        // 5. Update Event
        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                sport: body.sport,
                start_time: body.start_time ? new Date(body.start_time) : undefined,
                end_time: body.end_time ? new Date(body.end_time) : undefined,
                venue_name: body.venue_name,
                map_link: body.map_link,
                max_players: body.max_players ? parseInt(String(body.max_players)) : undefined,
                estimated_cost: body.estimated_cost ? parseFloat(String(body.estimated_cost)) : undefined,
            }
        });

        return NextResponse.json(updatedEvent);

    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
