
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
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const users = await prisma.user.findMany({
            where: { createdAt: { gte: ninetyDaysAgo } },
            select: { createdAt: true }
        });

        // Group by Date (YYYY-MM-DD)
        const groups: Record<string, number> = {};
        users.forEach(u => {
            const date = u.createdAt.toISOString().split('T')[0];
            groups[date] = (groups[date] || 0) + 1;
        });

        // Fill in missing days (optional, doing sparse for now to keep it simple)
        const data = Object.keys(groups).map(date => ({
            date,
            users: groups[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(data);

    } catch (error) {
        console.error("Admin Growth Error:", error);
        return NextResponse.json({ error: "Failed to fetch Growth data" }, { status: 500 });
    }
}
