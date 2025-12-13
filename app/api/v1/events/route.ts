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
            organizer_email // Mock auth
        } = body;

        // AUTHENTICATION
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizer = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!organizer) {
            return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
        }

        // Basic validation
        if (!sport || !start_time || !end_time || !venue_name || !map_link || !max_players || !estimated_cost) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Create Event & Assign Role (if needed)
        const event = await prisma.$transaction(async (tx: any) => {
            const newEvent = await tx.event.create({
                data: {
                    organizer_id: session.user.id,
                    company_id: (session.user as any).primary_company_id || null, // Assuming fetched in session or available via user lookup
                    sport: body.sport,
                    start_time: new Date(body.start_time),
                    end_time: new Date(body.end_time),
                    venue_name: body.venue_name,
                    map_link: body.map_link,
                    max_players: body.max_players,
                    estimated_cost: body.estimated_cost,
                    club_id: body.club_id || null,
                    status: 'Draft', // Default status
                }
            });

            // 4. Dynamic Organizer Role Assignment
            // Check if user already has 'Organizer' role
            const hasOrganizerRole = await tx.userRole.findFirst({
                where: {
                    user_id: session.user.id,
                    role: { name: 'Organizer' }
                }
            });

            if (!hasOrganizerRole) {
                const organizerRole = await tx.role.findUnique({ where: { name: 'Organizer' } });
                if (organizerRole) {
                    await tx.userRole.create({
                        data: {
                            user_id: session.user.id,
                            role_id: organizerRole.id,
                            company_id: (session.user as any).primary_company_id || null
                        }
                    });
                }
            }

            return newEvent;
        });

        // 5. Add Organizer as Participant (Confirmed)
        await prisma.participant.create({
            data: {
                event_id: event.id,
                user_id: session.user.id,
                status: 'Organizer',
                is_paid: true, // Organizer handles money, effectively paid/exempt
                payment_status: 'Paid'
            }
        });

        return NextResponse.json({ id: event.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
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
                        skill_level: true,
                    },
                },
            },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
