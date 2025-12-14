import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();

        // Fetch events where user is organizer OR participant
        // We fetch a bit more than 5 to merge and sort in memory if needed, 
        // but since we want a combined list sorted by time, we can try to do it effectively.
        // Prisma doesn't easily support "Union" queries directly in one go with clean sort for disparate relations.
        // So we will fetch 5 from each source and merge/sort/slice.

        const [hostedEvents, participatedEvents] = await Promise.all([
            prisma.event.findMany({
                where: {
                    organizer_id: user.id,
                    start_time: { gt: now }
                },
                include: {
                    organizer: { select: { email: true, name: true } },
                    participants: { select: { status: true } } // needed for count
                },
                orderBy: { start_time: 'asc' },
                take: 50
            }),
            prisma.participant.findMany({
                where: {
                    user_id: user.id,
                    event: { start_time: { gt: now } },
                    status: { in: ['Confirmed', 'Waitlist', 'Maybe'] }
                },
                include: {
                    event: {
                        include: {
                            organizer: { select: { email: true, name: true } },
                            participants: { select: { status: true } }
                        }
                    }
                },
                orderBy: { event: { start_time: 'asc' } },
                take: 50
            })
        ]);

        // Normalize participants to events
        const participationEventsNormalized = participatedEvents.map(p => ({
            ...p.event,
            currentUserStatus: p.status // Attach the user's status for the UI
        }));

        // Normalize hosted events
        const hostedEventsNormalized = hostedEvents.map(e => ({
            ...e,
            currentUserStatus: 'Organizer'
        }));

        // Combine
        // Note: A user could theoretically be both organizer and participant (if they added themselves to list),
        // usually organizer logic handles this. We de-duplicate by ID just in case.
        const combined = [...hostedEventsNormalized, ...participationEventsNormalized];

        // Deduplicate by event.id
        const uniqueEvents = Array.from(new Map(combined.map(item => [item.id, item])).values());

        // Sort by start_time
        uniqueEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        // Take top 50
        const finalEvents = uniqueEvents.slice(0, 50).map(event => {
            const confirmedCount = event.participants.filter((p: any) => p.status === 'Confirmed').length;
            return {
                id: event.id,
                title: event.sport, // Removed 'Match' suffix
                sport: event.sport,
                start_time: event.start_time,
                end_time: event.end_time, // Added end_time
                venue_name: event.venue_name,
                map_link: event.map_link,
                organizer_name: event.organizer.name || event.organizer.email.split('@')[0],
                currentUserStatus: event.currentUserStatus, // 'Organizer' | 'Confirmed' | ...
                confirmedCount: confirmedCount,
                max_players: event.max_players
            };
        });

        return NextResponse.json(finalEvents);

    } catch (error) {
        console.error('Error fetching dashboard events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
