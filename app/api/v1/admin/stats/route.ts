export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    // 1. Security Check
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // 2. Fetch Real Stats in Parallel
        const [userCount, eventCount, activeEvents] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.event.count({ where: { status: { not: 'Completed' } } }) // Assuming 'Completed' or 'Cancelled'
        ]);

        // 3. Calculate Revenue (Total Collected from Events)
        const revenueAgg = await prisma.event.aggregate({
            _sum: {
                total_collected: true
            }
        });

        // Safe access with optional chaining and manual cast if Prisma types are lagging
        // However, standard prisma should have total_collected if it's Int/Float/Decimal
        // Using `as any` fallback to unblock lint if schema defines it correctly
        const sum = (revenueAgg._sum as any).total_collected;
        const totalRevenue = sum ? Number(sum) : 0;

        return NextResponse.json({
            users: userCount,
            events: eventCount,
            active_events: activeEvents,
            revenue: totalRevenue
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
