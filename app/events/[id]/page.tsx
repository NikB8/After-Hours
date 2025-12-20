import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RsvpAction from '@/components/RsvpAction';
import RecommendationForm from '@/components/RecommendationForm';
import TeamBuilder from '@/components/TeamBuilder';
import FinancialHub from '@/components/FinancialHub';
import ResponseBreakdown from '@/components/ResponseBreakdown';
import TransportCoordination from '@/components/TransportCoordination';
import PaymentDueCard from '@/components/PaymentDueCard';
import EventInfoCard from '@/components/EventInfoCard';
import EventStatusManager from '@/components/EventStatusManager';
import { Calendar } from 'lucide-react';

import { auth } from '@/auth';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();
    const currentUser = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            organizer: true,
            participants: true,
        },
    });

    if (!event) {
        notFound();
    }

    const confirmedCount = event.participants.filter(p => p.status === 'Confirmed').length;

    // Determine current user's status
    let userStatus: 'Confirmed' | 'Waitlist' | 'Declined' | 'None' | 'Invited' = 'None';
    if (currentUser) {
        const participant = event.participants.find(p => p.user_id === currentUser.id);
        if (participant) {
            userStatus = participant.status as any;
        } else if (event.organizer_id !== currentUser.id) {
            // New visitor: Mark as 'Invited' so it shows up on their dashboard
            await prisma.participant.create({
                data: {
                    event_id: event.id,
                    user_id: currentUser.id,
                    status: 'Invited'
                }
            });
            userStatus = 'Invited';
        }
    }

    const isOrganizer = currentUser ? event.organizer_id === currentUser.id : false;
    const isCompleted = event.status === 'Completed' || new Date() > new Date(event.end_time);
    const isCreator = isOrganizer; // Alias for consistency if needed, checking usages
    const isSuperAdmin = currentUser?.is_super_admin || false;

    // Serialize Decimal fields to numbers/strings to pass to Client Component
    const serializedEvent = {
        ...event,
        estimated_cost: event.estimated_cost ? Number(event.estimated_cost) : 0,
        actual_cost: event.actual_cost ? Number(event.actual_cost) : 0,
        total_cost_final: event.total_cost_final ? Number(event.total_cost_final) : 0,
        total_collected: event.total_collected ? Number(event.total_collected) : 0,
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Hero Image Section */}
                <div
                    className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-sm border border-border"
                    style={{ viewTransitionName: `event-image-${event.id}` } as React.CSSProperties}
                >
                    {(event as any).image_url ? (
                        <img
                            src={(event as any).image_url}
                            alt={(event as any).title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Calendar className="w-20 h-20 text-primary/40" />
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-32" />
                </div>

                {/* Actions Bar */}
                {(isOrganizer || isSuperAdmin) && (
                    <div className="flex justify-end">
                        <a
                            href={`/events/${event.id}/edit`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            ✏️ Edit Event
                        </a>
                    </div>
                )}

                {/* Event Details Card */}
                <EventInfoCard event={serializedEvent} />


                {/* RSVP Action Card */}
                {currentUser && (
                    <>
                        <EventStatusManager
                            eventId={event.id}
                            maxPlayers={event.max_players}
                            initialConfirmedCount={confirmedCount}
                            initialUserStatus={userStatus}
                            userEmail={currentUser.email}
                            isCompleted={isCompleted}
                            isAdmin={isOrganizer || isSuperAdmin}
                        />

                        {isOrganizer && (
                            <div className="bg-card p-6 rounded-xl shadow-md border border-border mt-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">📢 Response Breakdown</h3>
                                <ResponseBreakdown eventId={event.id} />
                            </div>
                        )}

                        <RecommendationForm
                            eventId={event.id}
                            userEmail={currentUser.email}
                        />

                        <TeamBuilder
                            eventId={event.id}
                            userEmail={currentUser.email}
                            userId={currentUser.id}
                            isOrganizer={isOrganizer}
                        />

                        <FinancialHub
                            eventId={event.id}
                            userId={currentUser.id}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
