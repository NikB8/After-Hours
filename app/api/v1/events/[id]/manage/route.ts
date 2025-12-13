
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { auth } from "@/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // AUTHENTICATION: Check for valid session
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
        }

        // Fetch user details from DB to ensure we have custom fields like id, upi_id (if not in session)
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized: User record not found' }, { status: 401 });
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: true,
                participants: {
                    include: {
                        user: true, // Needed for names/emails in dashboard
                    }
                },
                club: true,
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Authorization Check: Only Organizer can access this data
        if (event.organizer_id !== currentUser.id) {
            return NextResponse.json({ error: 'Forbidden: Only the organizer can manage this event' }, { status: 403 });
        }

        // Calculate aggregate data for easier consumption mainly for Finance/Logistics tabs

        // Finance Summary
        const financeSummary = {
            estimated_cost: event.estimated_cost,
            actual_cost: event.actual_cost,
            total_collected: event.participants.reduce((sum, p) => sum + (p.is_paid ? Number(p.amount_due) : 0), 0),
            pending_amount: event.participants.reduce((sum, p) => sum + (!p.is_paid ? Number(p.amount_due) : 0), 0),
        };

        // Logistics Summary
        const logisticsSummary = {
            total_participants: event.participants.length,
            confirmed: event.participants.filter(p => p.status === 'Confirmed').length,
            waitlist: event.participants.filter(p => p.status === 'Waitlist').length,
            needs_ride: event.participants.filter(p => p.transport_mode === 'Rider' && !p.assigned_driver_id).length,
            drivers_available: event.participants.filter(p => p.transport_mode === 'Driver').length,
        };

        return NextResponse.json({
            event,
            financeSummary,
            logisticsSummary,
            currentUser: { id: currentUser.id, email: currentUser.email } // Useful for frontend checks
        });

    } catch (error) {
        console.error('Error fetching event management data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
