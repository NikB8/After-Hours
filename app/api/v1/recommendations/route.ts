import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            recommender_email, // Mock auth
            name,
            contact_info,
            event_id,
        } = body;

        if (!recommender_email || !name || !contact_info) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Mock auth: find recommender
        const recommender = await prisma.user.findUnique({ where: { email: recommender_email } });
        if (!recommender) {
            return NextResponse.json({ error: 'Recommender not found' }, { status: 404 });
        }

        // Create recommendation
        const recommendation = await prisma.recommendation.create({
            data: {
                recommender_id: recommender.id,
                name,
                contact_info,
                event_id: event_id || null,
                status: 'Invited', // Auto-set to invited for this flow
            },
        });

        // Simulate sending invite (Console log)
        console.log(`--- SIMULATING INVITE ---`);
        console.log(`To: ${name} (${contact_info})`);
        console.log(`From: ${recommender.email}`);
        if (event_id) {
            console.log(`Subject: You're invited to a game!`);
            console.log(`Message: Hey ${name}, come play with us! Check out this event.`);
        } else {
            console.log(`Subject: Join After Hours!`);
            console.log(`Message: Hey ${name}, check out this cool sports app.`);
        }
        console.log(`-------------------------`);

        // Generate a mock WhatsApp link
        const message = event_id
            ? `Hey ${name}, join me for a game on After Hours!`
            : `Hey ${name}, check out After Hours!`;
        const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

        return NextResponse.json({
            recommendation,
            wa_link: waLink,
            message: 'Invitation sent successfully (simulated)'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating recommendation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
