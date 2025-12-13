
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const body = await request.json();
        const { roleId, companyId } = body;

        if (!roleId) return NextResponse.json({ error: 'Role ID required' }, { status: 400 });

        // Check if role exists
        const role = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
        if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

        // Create UserRole (Composite Unique Constraint handles duplicates, but strict check is nice)
        const userRole = await prisma.userRole.create({
            data: {
                user_id: id,
                role_id: parseInt(roleId),
                company_id: companyId ? parseInt(companyId) : null
            }
        });

        return NextResponse.json({ success: true, userRole });
    } catch (error) {
        console.error("Add Role Error:", error);
        return NextResponse.json({ error: "Failed to add role. It may already exist." }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const body = await request.json(); // We need to know WHICH role instance to delete (UserRole ID or Role ID?)
        // Standard approach: Pass UserRole ID if known, or Role ID + Company context.
        // Let's expect 'userRoleId' for precision.
        const { userRoleId } = body;

        if (!userRoleId) return NextResponse.json({ error: 'UserRole ID required' }, { status: 400 });

        await prisma.userRole.delete({
            where: { id: parseInt(userRoleId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove Role Error:", error);
        return NextResponse.json({ error: "Failed to remove role" }, { status: 500 });
    }
}
