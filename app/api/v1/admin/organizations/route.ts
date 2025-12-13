
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
        // Group users by company_domain
        const groups = await prisma.user.groupBy({
            by: ['company_domain'],
            _count: {
                id: true
            },
            where: {
                company_domain: { not: null }
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        // Format for frontend
        const orgs = groups.map(g => ({
            domain: g.company_domain,
            user_count: g._count.id
        }));

        return NextResponse.json(orgs);

    } catch (error) {
        console.error("Admin Orgs Error:", error);
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
}
