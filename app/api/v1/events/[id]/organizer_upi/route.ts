
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: { organizer: { select: { upi_id: true, email: true } } }
        });

        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        // In a real app we might check if the requester is a participant, but for now public read of UPI for payment is acceptable context
        return NextResponse.json({
            upi_id: event.organizer.upi_id,
            payee_name: event.organizer.email // Or a real name if available
        });

    } catch (error) {
        console.error('Error fetching organizer UPI:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
