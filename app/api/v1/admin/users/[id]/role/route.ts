
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { is_super_admin } = body;

        if (typeof is_super_admin !== 'boolean') {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { is_super_admin }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Admin Role Update Error:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
