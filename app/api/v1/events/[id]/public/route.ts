
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
            select: {
                id: true,
                sport: true,
                start_time: true,
                end_time: true,
                venue_name: true,
                map_link: true,
                status: true,
                max_players: true,
                participants: {
                    where: { status: 'Confirmed' },
                    select: {
                        status: true,
                        user: {
                            select: {
                                id: true,
                                email: true, // In a real app we might mask this or only show name if available
                                // bio: true, // Optional: show bio if relevant
                            }
                        }
                    }
                },
                organizer: {
                    select: {
                        email: true,
                    }
                }
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Simplify response structure for the frontend card
        const publicData = {
            id: event.id,
            sport: event.sport,
            date: event.start_time,
            venue: event.venue_name,
            map_link: event.map_link,
            status: event.status,
            max_players: event.max_players,
            current_players: event.participants.length,
            participants: event.participants.map(p => ({
                id: p.user.id,
                name: p.user.email.split('@')[0], // Privacy: Only show local part of email/name
                // Removed email field to prevent PII leakage
            })),
            organizer: event.organizer.email.split('@')[0] // Privacy: Mask organizer email
        };

        return NextResponse.json(publicData);

    } catch (error: any) {
        console.error('Error fetching public event data:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
    }
}
