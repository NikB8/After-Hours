import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('user_email');

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user || !user.is_super_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const [userCount, eventCount, clubCount, partnerCount] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.club.count(),
            prisma.corporatePartner.count(),
        ]);

        return NextResponse.json({
            users: userCount,
            events: eventCount,
            clubs: clubCount,
            partners: partnerCount,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
