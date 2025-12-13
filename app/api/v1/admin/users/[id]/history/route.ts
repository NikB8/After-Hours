import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;

    // Await params first to use its value in the authorization check
    const { id: userId } = await params;

    // Allow super admins or the user themselves to view their history
    if (!isSuperAdmin && session?.user?.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


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
