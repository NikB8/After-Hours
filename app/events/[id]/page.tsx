import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RsvpAction from '@/components/RsvpAction';
import RecommendationForm from '@/components/RecommendationForm';
import CarpoolCoordinator from '@/components/CarpoolCoordinator';
import TeamBuilder from '@/components/TeamBuilder';
import ExpenseSettlement from '@/components/ExpenseSettlement';

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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Event Details Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{event.sport} Game</h1>
                            <p className="mt-2 text-gray-600 flex items-center">
                                <span className="mr-2">📍</span>
                                <a href={event.map_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {event.venue_name}
                                </a>
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {event.status}
                        </span>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                                <p className="mt-1 text-lg text-gray-900">
                                    {new Date(event.start_time).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
                                <p className="mt-1 text-lg text-gray-900">{event.organizer.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Cost</h3>
                                <p className="mt-1 text-lg text-gray-900">${event.estimated_cost.toString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RSVP Action Card */}
                {currentUser && (
                    <>
                        <RsvpAction
                            eventId={event.id}
                            maxPlayers={event.max_players}
                            confirmedCount={confirmedCount}
                            userStatus={userStatus}
                            userEmail={currentUser.email}
                        />

                        <RecommendationForm
                            eventId={event.id}
                            userEmail={currentUser.email}
                        />

                        <CarpoolCoordinator
                            eventId={event.id}
                            userEmail={currentUser.email}
                        />

                        <TeamBuilder
                            eventId={event.id}
                            userEmail={currentUser.email}
                            isOrganizer={isOrganizer}
                        />

                        <ExpenseSettlement
                            eventId={event.id}
                            userEmail={currentUser.email}
                            isOrganizer={isOrganizer}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
