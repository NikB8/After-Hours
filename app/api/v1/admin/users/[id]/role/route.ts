import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;
        const body = await request.json();
        const { user_email, is_super_admin } = body;

        if (!user_email || is_super_admin === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify Requester is Super Admin
        const requester = await prisma.user.findUnique({ where: { email: user_email } });
        if (!requester || !requester.is_super_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent self-demotion
        if (requester.id === targetUserId && is_super_admin === false) {
            return NextResponse.json({ error: 'Cannot revoke your own admin status' }, { status: 400 });
        }

        // Update Target User
        await prisma.user.update({
            where: { id: targetUserId },
            data: { is_super_admin: Boolean(is_super_admin) },
        });

        return NextResponse.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
