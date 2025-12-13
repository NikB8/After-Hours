
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('user_email');

        if (!userEmail) {
            // In a real app, we check session here.
            return NextResponse.json({ error: 'User email required' }, { status: 401 });
        }

        // 1. Verify Requesting User is Confirmed
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const requestor = await prisma.participant.findUnique({
            where: {
                event_id_user_id: { event_id: eventId, user_id: user.id }
            }
        });

        if (!requestor || requestor.status !== 'Confirmed') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 2. Fetch Event Financials
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                total_cost_final: true,
                total_collected: true,
                participants: {
                    where: { status: 'Confirmed' },
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        // 3. Construct Response
        // List of all confirmed members and their payment status
        const paymentList = event.participants.map(p => ({
            user_id: p.user.id,
            user_name: p.user.name || p.user.email,
            is_paid: p.is_paid
        }));

        // Calculate 'Still Owed' (Total Cost - Collected)
        const total = Number(event.total_cost_final || 0);
        const collected = Number(event.total_collected || 0);
        const outstanding = Math.max(0, total - collected);

        return NextResponse.json({
            total_cost: total,
            total_collected: collected,
            total_outcome_outstanding: outstanding,
            my_amount_due: requestor.amount_due,
            my_is_paid: requestor.is_paid,
            participants: paymentList
        });

    } catch (error) {
        console.error('Error fetching member finance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
