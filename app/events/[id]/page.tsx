import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RsvpAction from '@/components/RsvpAction';
import RecommendationForm from '@/components/RecommendationForm';
import TeamBuilder from '@/components/TeamBuilder';
import ExpenseSettlement from '@/components/ExpenseSettlement';
import ResponseBreakdown from '@/components/ResponseBreakdown';
import TransportCoordination from '@/components/TransportCoordination';
import PaymentDueCard from '@/components/PaymentDueCard';
import EventInfoCard from '@/components/EventInfoCard';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Mock auth: get current user (first user for demo)
    const currentUser = await prisma.user.findFirst();

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
    let userStatus: 'Confirmed' | 'Waitlist' | 'Declined' | 'None' = 'None';
    if (currentUser) {
        const participant = event.participants.find(p => p.user_id === currentUser.id);
        if (participant) {
            userStatus = participant.status as any;
        }
    }

    const isOrganizer = currentUser ? event.organizer_id === currentUser.id : false;
    const isCompleted = event.status === 'Completed';
    const isCreator = isOrganizer; // Alias for consistency if needed, checking usages
    const isSuperAdmin = false; // Placeholder if variable is used in JSX template

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
                {/* Event Details Card */}
                <EventInfoCard event={serializedEvent} />

                {/* RSVP Action Card */}
                {currentUser && (
                    <>
                        {/* Show Expense Tracking if Completed and Confirmed, else show RSVP */}
                        {isCompleted && userStatus === 'Confirmed' ? (
                            <PaymentDueCard
                                eventId={event.id}
                                userEmail={currentUser.email}
                            />
                        ) : (
                            <RsvpAction
                                eventId={event.id}
                                maxPlayers={event.max_players}
                                confirmedCount={confirmedCount}
                                userStatus={userStatus}
                                userEmail={currentUser.email}
                            />
                        )}

                        {userStatus === 'Confirmed' && (
                            <TransportCoordination
                                eventId={event.id}
                            />
                        )}

                        {isOrganizer && (
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">📢 Response Breakdown</h3>
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

                        <ExpenseSettlement
                            eventId={event.id}
                            userEmail={currentUser.email}
                            userId={currentUser.id}
                            isOrganizer={isOrganizer}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
