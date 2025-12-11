import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { driver_email, rider_email } = body;

        if (!driver_email || !rider_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get Driver User ID
        const driverUser = await prisma.user.findUnique({ where: { email: driver_email } });
        if (!driverUser) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

        // Get Rider User ID
        const riderUser = await prisma.user.findUnique({ where: { email: rider_email } });
        if (!riderUser) return NextResponse.json({ error: 'Rider not found' }, { status: 404 });

        // Verify Driver is actually a Driver for this event
        const driverParticipant = await prisma.participant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: driverUser.id,
                },
            },
        });

        if (!driverParticipant || driverParticipant.transport_mode !== 'Driver') {
            return NextResponse.json({ error: 'User is not a driver for this event' }, { status: 400 });
        }

        // Update Rider's participant record
        const riderParticipant = await prisma.participant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: riderUser.id,
                },
            },
        });

        if (!riderParticipant) {
            return NextResponse.json({ error: 'Rider is not a participant' }, { status: 404 });
        }

        await prisma.participant.update({
            where: { id: riderParticipant.id },
            data: {
                assigned_driver_id: driverUser.id,
            },
        });

        return NextResponse.json({ message: 'Rider assigned to driver' });
    } catch (error) {
        console.error('Error assigning rider:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
