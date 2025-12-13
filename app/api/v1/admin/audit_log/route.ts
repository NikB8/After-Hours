
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    try {
        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.adminAuditLog.count()
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        });

    } catch (error) {
        console.error("Audit Log Error:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
