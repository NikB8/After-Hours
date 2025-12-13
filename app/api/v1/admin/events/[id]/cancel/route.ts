
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: eventId } = await params;

    try {
        const { reason } = await req.json();

        // 1. Update Event
        const event = await prisma.event.update({
            where: { id: eventId },
            data: { status: 'Canceled' }
        });

        // 2. Log Audit
        await prisma.adminAuditLog.create({
            data: {
                admin_email: session?.user?.email || 'Unknown',
                action: 'CANCEL_EVENT',
                target: `Event: ${eventId}`,
                details: {
                    reason,
                    sport: event.sport,
                    date: event.start_time
                }
            }
        });

        // TODO: Trigger Notification to all participants
        console.log(`[Notification] Would send cancellation email for event ${eventId} due to ${reason}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Cancel Event Error:", error);
        return NextResponse.json({ error: "Failed to cancel event" }, { status: 500 });
    }
}
