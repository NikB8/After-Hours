import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const email = 'nikhil@example.com';
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword
            },
            create: {
                email,
                password: hashedPassword,
                name: "Nikhil Dev",
                company_domain: 'example.com',
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
