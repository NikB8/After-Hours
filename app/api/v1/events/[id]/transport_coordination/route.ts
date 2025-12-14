import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const session = await auth();

        // 1. Access Control: Must be authenticated
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Event & Participant status
        // User must be 'Confirmed' to see this (or admin)
        const viewer = await prisma.participant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: session.user.id
                }
            }
        });

        // Allow if Confirmed or Organizer (checked via event relation?) or Admin
        // For simplicity: If not confirmed and not organizer, deny.
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        const isOrganizer = event.organizer_id === session.user.id;
        const isConfirmed = viewer?.status === 'Confirmed';

        if (!isOrganizer && !isConfirmed) {
            return NextResponse.json({ error: 'Access denied. You must be a confirmed participant.' }, { status: 403 });
        }

        // 3. Fetch all confirmed participants
        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: 'Confirmed'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        // 4. Return formatted list
        const formattedList = participants.map(p => ({
            id: p.id,
            user_id: p.user_id,
            user_name: p.user.name || p.user.email,
            user_image: p.user.image,
            transport_mode: p.transport_mode,
            car_seats: p.car_seats,
            contact_info: p.user.email // Could adjust privacy later
        }));

        return NextResponse.json(formattedList);

    } catch (error) {
        console.error('Error fetching transport coordination:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
