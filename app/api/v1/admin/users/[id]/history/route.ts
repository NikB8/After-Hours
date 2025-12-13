
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Await params if using Next.js 15+, but standard 14 approach:
    // Actually safe to just use params.id usually, but let's be careful.
    const userId = params.id;

    try {
        // Fetch Participation History
        const participations = await prisma.participant.findMany({
            where: { user_id: userId },
            include: {
                event: {
                    select: {
                        id: true,
                        sport: true,
                        start_time: true,
                        actual_cost: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to a cleaner history object
        const history = participations.map(p => ({
            type: 'GAME',
            date: p.event.start_time,
            description: `Played ${p.event.sport}`,
            amount: p.amount_due,
            status: p.is_paid ? 'PAID' : 'PENDING', // Use is_paid boolean
            is_settled: p.is_paid
        }));

        // In functionality expansion, we could add "Logins" or "Profile Updates" here if we had a logs table.

        return NextResponse.json(history);

    } catch (error) {
        console.error("User History Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
