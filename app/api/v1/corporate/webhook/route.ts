import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            employee_email,
            employee_name,
            opt_in,
            api_key,
        } = body;

        // 1. Validate API Key
        if (!api_key) {
            return NextResponse.json({ error: 'API Key required' }, { status: 401 });
        }

        const partner = await prisma.corporatePartner.findFirst({
            where: { api_key },
        });

        if (!partner) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }

        // 2. Process Opt-in
        if (opt_in) {
            // Check if user exists
            let user = await prisma.user.findUnique({
                where: { email: employee_email },
            });

            if (!user) {
                // Create new user (invited state)
                user = await prisma.user.create({
                    data: {
                        email: employee_email,
                        company_domain: partner.domain,
                        skill_level: 'Beginner', // Default
                        bio: `Joined via ${partner.name} Corporate Program`,
                    },
                });
                console.log(`Created new user ${employee_email} from HRMS webhook`);
            } else {
                // Update existing user
                await prisma.user.update({
                    where: { id: user.id },
                    data: { company_domain: partner.domain },
                });
                console.log(`Updated user ${employee_email} with corporate domain`);
            }

            // Simulate sending welcome email
            console.log(`--- SENDING WELCOME EMAIL ---`);
            console.log(`To: ${employee_email}`);
            console.log(`Subject: Welcome to After Hours - ${partner.name} Sports Club!`);
            console.log(`Hi ${employee_name}, welcome to the club!`);
            console.log(`-----------------------------`);
        }

        return NextResponse.json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
