
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { user_id } = await req.json();

        const targetUser = await prisma.user.findUnique({ where: { id: user_id } });
        if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Generate Impersonation Token (Mocking a signed token)
        const impersonationToken = `imp_${uuidv4()}_${user_id}`;

        // Audit Log
        await prisma.adminAuditLog.create({
            data: {
                admin_email: session?.user?.email || 'Unknown',
                action: 'IMPERSONATE_USER_START',
                target: `User: ${targetUser.email}`,
                details: {
                    token_id: impersonationToken,
                    expires_in: '15m'
                }
            }
        });

        return NextResponse.json({
            token: impersonationToken,
            redirectUrl: `/?impersonate=${impersonationToken}` // Frontend can use this
        });

    } catch (error) {
        console.error("Impersonate Error:", error);
        return NextResponse.json({ error: "Failed to impersonate" }, { status: 500 });
    }
}
