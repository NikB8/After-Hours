
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { participant_id } = await req.json();

        // 1. Get current state for log
        const participant = await prisma.participant.findUnique({
            where: { id: participant_id },
            include: { user: true }
        });

        if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

        // 2. Update to PAID
        await prisma.participant.update({
            where: { id: participant_id },
            data: {
                is_paid: true,
                payment_status: 'Paid'
            }
        });

        // 3. Create Audit Log
        await prisma.adminAuditLog.create({
            data: {
                admin_email: session?.user?.email || 'Unknown',
                action: 'OVERRIDE_PAYMENT_PAID',
                target: `Participant: ${participant_id} (User: ${participant.user.email})`,
                details: {
                    previous_status: participant.payment_status,
                    amount: participant.amount_due
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Override Payment Error:", error);
        return NextResponse.json({ error: "Failed to override payment" }, { status: 500 });
    }
}
