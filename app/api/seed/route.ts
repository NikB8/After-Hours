import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const email = 'nikhil@example.com';
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                company_domain: 'example.com',
                skill_level: 'Advanced',
                bio: 'Founder',
                is_super_admin: true
            },
        });
        return NextResponse.json({ message: 'User seeded', user });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
    }
}
