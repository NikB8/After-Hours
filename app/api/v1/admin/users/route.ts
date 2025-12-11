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

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to 50 for now
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
