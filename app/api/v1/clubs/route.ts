import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, category, user_email } = body;

        if (!name || !description || !category || !user_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Mock auth: find user
        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.company_domain) {
            return NextResponse.json({ error: 'User must belong to a company to create a club' }, { status: 403 });
        }

        // Create Club and make creator an Admin
        const club = await prisma.club.create({
            data: {
                name,
                description,
                category,
                company_domain: user.company_domain,
                created_by_id: user.id,
                members: {
                    create: {
                        user_id: user.id,
                        role: 'Admin',
                    },
                },
            },
        });

        return NextResponse.json(club, { status: 201 });
    } catch (error) {
        console.error('Error creating club:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user_email = searchParams.get('user_email');

        if (!user_email) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user || !user.company_domain) {
            return NextResponse.json({ clubs: [] }); // No company, no clubs
        }

        const clubs = await prisma.club.findMany({
            where: {
                company_domain: user.company_domain,
            },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });

        return NextResponse.json({ clubs });
    } catch (error) {
        console.error('Error listing clubs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
