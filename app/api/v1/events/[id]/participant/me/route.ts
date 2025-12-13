
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email } = body;

        if (!user_email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const participant = await prisma.participant.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: user.id
                }
            }
        });

        if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

        return NextResponse.json({
            amount_due: participant.amount_due,
            is_paid: participant.is_paid,
            payment_status: participant.payment_status
        });

    } catch (error) {
        console.error('Error fetching participant status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
