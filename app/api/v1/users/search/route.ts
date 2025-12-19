
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, primary_company_id: true }
        });

        if (!currentUser?.primary_company_id) {
            // If user has no company, they can't search company members
            return NextResponse.json([]);
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        const users = await prisma.user.findMany({
            where: {
                primary_company_id: currentUser.primary_company_id,
                AND: [
                    { id: { not: currentUser.id } }, // Exclude self
                    {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: 20
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
