import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Basic validation
        if (!sport || !start_time || !end_time || !venue_name || !map_link || !max_players || !estimated_cost) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Mock auth: find user by email or use first user
        let organizer;
        if (organizer_email) {
            organizer = await prisma.user.findUnique({ where: { email: organizer_email } });
        } else {
            organizer = await prisma.user.findFirst();
        }

        if (!organizer) {
            return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
        }

        const event = await prisma.event.create({
            data: {
                organizer_id: organizer.id,
                sport,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                venue_name,
                map_link,
                max_players: parseInt(max_players),
                estimated_cost: parseFloat(estimated_cost),
                status: 'Draft', // Default status
            },
        });

        return NextResponse.json(event, { status: 201 });
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
