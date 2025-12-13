
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const outstanding = await prisma.participant.findMany({
            where: {
                is_paid: false,
                amount_due: { gt: 0 }
            },
            include: {
                user: { select: { email: true, name: true } },
                event: { select: { sport: true, start_time: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(outstanding);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch outstanding" }, { status: 500 });
    }
}
