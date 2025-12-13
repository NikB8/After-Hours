import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // Fetch event details for location
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { venue_name: true, map_link: true }
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: 'Confirmed',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true, // Added name for UI
                        email: true,
                        image: true, // Added image for UI
                    },
                },
            },
        });

        // Helper to get driver email for a rider
        const getDriverEmail = (driverId: string | null) => {
            if (!driverId) return null;
            const driver = participants.find(p => p.user_id === driverId);
            return driver ? driver.user.email : null;
        };

        // Helper to get payer email
        const getPayerEmail = (payerId: string | null) => {
            if (!payerId) return null;
            // Payer might not be a participant (unlikely but possible), but we only have participants loaded.
            // Ideally we should include the relation in the query, but for now let's check if payer is a participant.
            // If payer is not a participant, we might miss the name. 
            // Let's assume payer is a participant or the user themselves.
            const payer = participants.find(p => p.user_id === payerId);
            return payer ? payer.user.email : 'Unknown';
        };

        const enhanceParticipant = (p: any) => ({
            ...p,
            user_name: p.user.name || p.user.email, // Convenient field for UI
            user_image: p.user.image,
            assigned_driver_email: getDriverEmail(p.assigned_driver_id),
            paid_by_email: getPayerEmail(p.paid_by_id)
        });

        const drivers = participants.filter((p) => p.transport_mode === 'Driver').map(enhanceParticipant);
        const riders = participants.filter((p) => p.transport_mode === 'Rider').map(enhanceParticipant);
        const independent = participants.filter((p) => p.transport_mode === 'Independent').map(enhanceParticipant);

        return NextResponse.json({
            venue_name: event.venue_name,
            map_link: event.map_link,
            drivers,
            riders,
            independent,
        });
    } catch (error) {
        console.error('Error fetching logistics:', error);
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
        const { user_email, transport_mode, car_seats, pickup_location } = body;

        if (!user_email || !transport_mode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const participant = await prisma.participant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: user.id,
                },
            },
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        const updatedParticipant = await prisma.participant.update({
            where: { id: participant.id },
            data: {
                transport_mode,
                car_seats: transport_mode === 'Driver' ? (car_seats || 0) : 0,
                pickup_location: transport_mode === 'Driver' ? pickup_location : null,
            },
        });

        return NextResponse.json(updatedParticipant);
    } catch (error) {
        console.error('Error updating logistics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
