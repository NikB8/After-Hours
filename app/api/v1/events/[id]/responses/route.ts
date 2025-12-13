
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // Fetch all participants with user details
        const participants = await prisma.participant.findMany({
            where: { event_id: eventId },
            include: { user: { select: { id: true, name: true, email: true, image: true } } }
        });

        // Group by status
        const responses = {
            Confirmed: [] as any[],
            Waitlist: [] as any[],
            Maybe: [] as any[],
            Declined: [] as any[],
            Organizer: [] as any[]
        };

        participants.forEach(p => {
            if (p.status in responses) {
                // @ts-ignore
                responses[p.status].push(p.user);
            } else {
                // Handle cases where status might not match exact keys (though it should)
                // or group unknown statuses separately
            }
        });

        // Organizer usually has 'Organizer' status, but logic might vary. 
        // If 'Organizer' isn't a status in DB enums yet, it falls to Confirmed or custom.
        // Based on previous steps, 'Organizer' IS a status.

        return NextResponse.json({
            eventId,
            counts: {
                Confirmed: responses.Confirmed.length + responses.Organizer.length, // Treat Organizer as Confirmed for general count? Or separate? 
                // Request asked for: Confirmed (X), Maybe (Y), Declined (Z). 
                // Let's keep Organizer separate or merge into Confirmed for the UI count usually.
                // But for detailed list we return full structure.
                Organizer: responses.Organizer.length,
                Waitlist: responses.Waitlist.length,
                Maybe: responses.Maybe.length,
                Declined: responses.Declined.length
            },
            lists: responses
        });

    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
