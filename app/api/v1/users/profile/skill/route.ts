import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { skill_level, bio, email } = body; // In a real app, email/id would come from session

        // Basic validation
        const allowedSkills = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
        if (skill_level && !allowedSkills.includes(skill_level)) {
            return NextResponse.json({ error: 'Invalid skill level' }, { status: 400 });
        }

        // Mock auth: we expect email to be passed for now, or we'll find the first user
        // In production, use session.user.email
        let user;
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
        } else {
            // For demo purposes, if no email provided, update the first user found or create one
            user = await prisma.user.findFirst();
            if (!user) {
                // Create a dummy user for testing if none exists
                user = await prisma.user.create({
                    data: {
                        email: 'test@example.com',
                        company_domain: 'example.com',
                        skill_level: 'Beginner'
                    }
                });
            }
        }

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
