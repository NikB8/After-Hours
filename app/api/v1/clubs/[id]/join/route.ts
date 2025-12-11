import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clubId } = await params;
        const body = await request.json();
        const { user_email } = body;

        if (!user_email) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: user_email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const club = await prisma.club.findUnique({ where: { id: clubId } });
        if (!club) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }

        // Verify domain match
        if (user.company_domain !== club.company_domain) {
            return NextResponse.json({ error: 'You can only join clubs in your company' }, { status: 403 });
        }

        // Check if already a member
        const existingMember = await prisma.clubMember.findUnique({
            where: {
                club_id_user_id: {
                    club_id: clubId,
                    user_id: user.id,
                },
            },
        });

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member' });
        }

        await prisma.clubMember.create({
            data: {
                club_id: clubId,
                user_id: user.id,
                role: 'Member',
            },
        });

        return NextResponse.json({ message: 'Joined club successfully' });
    } catch (error) {
        console.error('Error joining club:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
