import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import EventInfoCard from '@/components/EventInfoCard';
import GuestRsvpAction from '@/components/GuestRsvpAction';

export default async function GuestEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    // Redirection Logic: If authenticated, go to main event page
    if (session?.user) {
        redirect(`/events/${id}`);
    }

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

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <EventInfoCard event={event} />

                <GuestRsvpAction
                    eventId={event.id}
                    maxPlayers={event.max_players}
                    confirmedCount={confirmedCount}
                />
            </div>
        </div>
    );
}
