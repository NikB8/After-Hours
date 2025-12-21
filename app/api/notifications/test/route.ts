import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyUser, NotificationType } from '@/lib/notifications';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Trigger test notification to self
    await notifyUser({
        recipientId: user.id,
        title: 'Test Notification',
        message: 'This is a test notification from the Master Notification System.',
        url: '/profile',
        type: NotificationType.SYSTEM
    });

    return NextResponse.json({ success: true });
}
