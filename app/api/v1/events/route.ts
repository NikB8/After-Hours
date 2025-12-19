import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            sport,
            start_time,
            end_time,
            venue_name,
            map_link,
            max_players,
            estimated_cost,
        } = body;

        // AUTHENTICATION
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizer = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!organizer) {
            return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
        }

        // Basic validation
        if (!sport || !start_time || !venue_name || !map_link || !max_players || !estimated_cost) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userId = session.user.id;
        const companyId = (session.user as any).primary_company_id || null;

        // 3. Create Event & Assign Role (if needed)
        const event = await prisma.$transaction(async (tx) => {
            const newEvent = await tx.event.create({
                data: {
                    organizer_id: userId,
                    company_id: companyId,
                    sport: body.sport,
                    start_time: new Date(body.start_time),
                    end_time: body.end_time ? new Date(body.end_time) : new Date(new Date(body.start_time).getTime() + 60 * 60 * 1000), // Default 1h
                    venue_name: body.venue_name,
                    map_link: body.map_link,
                    max_players: parseInt(str(body.max_players)) || 10,
                    estimated_cost: parseFloat(str(body.estimated_cost)) || 0,
                    club_id: body.club_id || null,
                    status: 'Open',
                }
            });

            // 4. Also add Organizer as a 'Confirmed' Participant (Creator usually plays)
            await tx.participant.create({
                data: {
                    event_id: newEvent.id,
                    user_id: userId,
                    status: 'Confirmed',
                    is_paid: true,
                    payment_status: 'Paid',
                    transport_mode: body.transport_mode || 'Independent',
                    car_seats: body.transport_mode === 'Driver' ? (parseInt(str(body.car_seats)) || 0) : 0
                }
            });

            // 5. Add Invited Participants
            if (body.invitedUserIds && Array.isArray(body.invitedUserIds)) {
                for (const invitedUserId of body.invitedUserIds) {
                    if (invitedUserId !== userId) { // Prevent self-invite loop if UI fails
                        await tx.participant.create({
                            data: {
                                event_id: newEvent.id,
                                user_id: invitedUserId,
                                status: 'Invited',
                                is_paid: false,
                                payment_status: 'Pending',
                                transport_mode: 'Independent'
                            }
                        });
                    }
                }
            }

            return newEvent;
        });

        return NextResponse.json({ id: event.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper to safely stringify for parsing
function str(val: any): string {
    return String(val);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'upcoming'

        let whereClause = {};
        if (type === 'upcoming') {
            whereClause = {
                start_time: {
                    gte: new Date(),
                },
                status: {
                    in: ['Open', 'Booked'],
                },
            };
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            orderBy: {
                start_time: 'asc',
            },
            include: {
                organizer: {
                    select: {
                        email: true,
                    },
                },
                _count: {
                    select: {
                        participants: true
                    }
                }
            },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
