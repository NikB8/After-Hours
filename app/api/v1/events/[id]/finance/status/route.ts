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

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch confirmed participants with financial info
        const participants = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                status: 'Confirmed'
            },
            select: {
                id: true,
                user_id: true,
                amount_due: true,
                is_paid: true,
                payment_status: true,
                paid_by_id: true,
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        // Fetch payer emails if any
        const payerIds = participants
            .map(p => p.paid_by_id)
            .filter((id): id is string => !!id);

        const payers = await prisma.user.findMany({
            where: { id: { in: payerIds } },
            select: { id: true, email: true }
        });

        const payerMap = new Map(payers.map(u => [u.id, u.email]));

        const formattedParticipants = participants.map(p => ({
            ...p,
            paid_by_email: p.paid_by_id ? payerMap.get(p.paid_by_id) : undefined
        }));

        // Fetch event finance details
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                estimated_cost: true,
                actual_cost: true,
                total_cost_final: true,
                total_collected: true,
                is_settled: true,
                financial_status: true,
                organizer_id: true,
                organizer: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        upi_id: true
                    }
                }
            }
        });

        const totalCost = Number(event?.total_cost_final || event?.actual_cost || event?.estimated_cost || 0);
        const confirmedCount = participants.length;
        const perPersonShare = confirmedCount > 0 ? (totalCost / confirmedCount) : 0;

        return NextResponse.json({
            event: { ...event, per_person_share: perPersonShare },
            participants: formattedParticipants
        });

    } catch (error) {
        console.error('Error fetching finance status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
