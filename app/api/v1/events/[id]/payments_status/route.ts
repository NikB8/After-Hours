
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: 'Confirmed'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                }
            }
        });

        const paid = participants.filter(p => p.is_paid);
        const unpaid = participants.filter(p => !p.is_paid);

        return NextResponse.json({
            paid: paid.map(p => ({
                participant_id: p.id,
                user_name: p.user.email.split('@')[0],
                user_email: p.user.email,
                amount_due: p.amount_due,
                is_paid: true
            })),
            unpaid: unpaid.map(p => ({
                participant_id: p.id,
                user_name: p.user.email.split('@')[0],
                user_email: p.user.email,
                amount_due: p.amount_due,
                is_paid: false
            }))
        });

    } catch (error) {
        console.error('Error fetching payment status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
