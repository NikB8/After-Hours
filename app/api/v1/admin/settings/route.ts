
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
        const settings = await prisma.globalSettings.findMany();
        // Convert array to object for easier frontend consumption
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        return NextResponse.json(settingsMap);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

        // Update or Create
        const oldSetting = await prisma.globalSettings.findUnique({ where: { key } });

        await prisma.globalSettings.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        // Audit Log
        await prisma.adminAuditLog.create({
            data: {
                admin_email: session?.user?.email || 'Unknown',
                action: 'UPDATE_GLOBAL_SETTING',
                target: `Setting: ${key}`,
                details: {
                    old_value: oldSetting?.value,
                    new_value: String(value)
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
}
