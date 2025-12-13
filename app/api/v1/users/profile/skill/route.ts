import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { skill_level, bio, email } = body; // In a real app, email/id would come from session

        // Basic validation
        const allowedSkills = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
        if (skill_level && !allowedSkills.includes(skill_level)) {
            return NextResponse.json({ error: 'Invalid skill level' }, { status: 400 });
        }

        // AUTHENTICATION
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (skill_level) updateData.skill_level = skill_level;
        if (bio !== undefined) updateData.bio = bio;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
