import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    try {
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { recipient_id: user.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    trigger_user: {
                        select: { name: true, image: true }
                    }
                }
            }),
            prisma.notification.count({ where: { recipient_id: user.id } }),
            prisma.notification.count({
                where: { recipient_id: user.id, is_read: false }
            }),
        ]);

        return NextResponse.json({
            notifications,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            unreadCount
        });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
