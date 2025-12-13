
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
        // 1. Total Value Settled (Collected)
        const settledAgg = await prisma.event.aggregate({
            _sum: { total_collected: true }
        });
        // Handle Prism type safety cast similar to stats route
        const totalSettled = Number((settledAgg._sum as any).total_collected || 0);

        // 2. Total Remaining Debt (Unpaid Participants in NOT-settled events?)
        // Or simplified: Any participant with is_paid=false and amount_due > 0
        const debtAgg = await prisma.participant.aggregate({
            where: {
                is_paid: false,
                amount_due: { gt: 0 }
            },
            _sum: { amount_due: true }
        });
        const totalDebt = Number((debtAgg._sum as any).amount_due || 0);

        // 3. Platform Fees (Estimated at 5% of Total Settled for visualization)
        // In real app, this would be a separate transaction table
        const platformFees = totalSettled * 0.05;

        return NextResponse.json({
            total_settled: totalSettled,
            total_debt: totalDebt,
            platform_fees: platformFees
        });

    } catch (error) {
        console.error("Admin Financials Error:", error);
        return NextResponse.json({ error: "Failed to fetch Financials" }, { status: 500 });
    }
}
