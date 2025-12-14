import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await auth();
        let email = session?.user?.email;

        // Allow passing email in body if not logged in (future proofing), 
        // but for this specific "Profile" use case, the user is logged in.
        // We prioritizing session email for security if available.

        if (!email) {
            const body = await req.json();
            email = body.email;
        }

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: 'If account exists, reset link sent.' });
        }

        // MOCK: Send Email
        console.log(`[MOCK EMAIL] Password reset requested for ${email}. Link: https://example.com/reset?token=abc`);

        return NextResponse.json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
