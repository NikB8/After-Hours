
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { user_email, total_cost_final } = body;

        // Validation
        if (!user_email || total_cost_final === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure total_cost_final is valid
        const finalCost = Number(total_cost_final);
        if (isNaN(finalCost) || finalCost < 0) {
            return NextResponse.json({ error: 'Invalid cost amount' }, { status: 400 });
        }

        // Verify Organizer and Event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizer: true, participants: true }
        });

        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.organizer.email !== user_email) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Calculate Split
        const confirmedParticipants = event.participants.filter(p => ['Confirmed', 'Organizer'].includes(p.status));
        const count = confirmedParticipants.length;

        if (count === 0) {
            return NextResponse.json({ error: 'Cannot settle event with 0 confirmed participants' }, { status: 400 });
        }

        const costPerPerson = finalCost / count;

        // Update DB in Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Event
            await tx.event.update({
                where: { id: eventId },
                data: {
                    total_cost_final: finalCost,
                    status: 'Completed' // Optional: auto-complete event? Yes, usually settlement happens after.
                }
            });

            // 2. Update Participants amount_due
            // We iterate because updateMany doesn't support 'where status=Confirmed' AND we might want to log individual changes ideally
            // But updateMany IS supported for basic filtering.
            await tx.participant.updateMany({
                where: {
                    event_id: eventId,
                    status: { in: ['Confirmed', 'Organizer'] }
                },
                data: {
                    amount_due: costPerPerson
                }
            });
        });

        return NextResponse.json({
            message: 'Event settled successfully',
            final_cost: finalCost,
            per_person: costPerPerson,
            participant_count: count
        });

    } catch (error) {
        console.error('Error settling event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
