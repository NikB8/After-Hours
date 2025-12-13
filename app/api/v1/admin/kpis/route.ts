
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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalUsers, totalGames, activeOrganizers] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.event.groupBy({
                by: ['organizer_id'],
                where: { createdAt: { gte: thirtyDaysAgo } }
            })
        ]);

        return NextResponse.json({
            total_users: totalUsers,
            total_games: totalGames,
            active_organizers_30d: activeOrganizers.length,
            api_error_rate_24h: 0.05 // Mocked
        });

    } catch (error) {
        console.error("Admin KPIs Error:", error);
        return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
    }
}
