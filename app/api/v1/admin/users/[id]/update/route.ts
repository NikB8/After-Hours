
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId } = await params;

    try {
        const body = await req.json();
        const { name, emailVerified, company_domain } = body;

        // Perform Update
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                // Handle date conversion if string passed, or null for unverify.
                // Assuming boolean toggle from UI -> convert to Date or null
                emailVerified: emailVerified ? new Date() : null,
                company_domain
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("User Update Error:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
