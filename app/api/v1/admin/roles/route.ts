
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(roles);
}

export async function POST(request: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

        const existing = await prisma.role.findUnique({ where: { name } });
        if (existing) return NextResponse.json({ error: 'Role already exists' }, { status: 409 });

        const role = await prisma.role.create({ data: { name, description } });
        return NextResponse.json(role);
    } catch (error) {
        console.error("Create Role Error:", error);
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
