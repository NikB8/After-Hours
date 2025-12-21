
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
        const { user_email } = body;

        // AUTHENTICATION: Check for valid session
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find user by session email
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        await prisma.participant.updateMany({
            where: {
                event_id: eventId,
                user_id: user.id
            },
            data: {
                payment_status: 'Pending_Confirmation'
            }
        });

        // NOTIFICATION
        // Fire and forget, or await to ensure delivery before response?
        // Awaiting best for serverless reliability.
        const event = await prisma.event.findUnique({ where: { id: eventId }, select: { organizer_id: true, sport: true } });
        if (event) {
            // We don't await this strictly to speed up response? No, safer to await.
            await notifyUser({
                recipientId: event.organizer_id,
                type: NotificationType.PAYMENT,
                title: 'Payment Claimed',
                message: `${user.name || user.email} marked payment as sent for ${event.sport}`,
                url: `/events/${eventId}/manage`, // Creator Dashboard
                triggerUserId: user.id
            });
        }

        return NextResponse.json({ success: true, status: 'Pending_Confirmation' });



    } catch (error) {
        console.error('Error notifying payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
