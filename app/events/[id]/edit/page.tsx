import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EventForm, { EventFormData } from '@/components/EventForm';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const currentUser = await prisma.user.findFirst();

    if (!currentUser) {
        redirect('/api/auth/signin');
    }

    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        notFound();
    }

    if (event.organizer_id !== currentUser.id && !currentUser.is_super_admin) {
        return (
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700">You are not authorized to edit this event.</p>
                </div>
            </div>
        );
    }

    // Format for form
    const initialData: EventFormData = {
        sport: event.sport,
        start_time: new Date(event.start_time).toISOString().slice(0, 16),
        end_time: new Date(event.end_time).toISOString().slice(0, 16),
        venue_name: event.venue_name,
        map_link: event.map_link,
        max_players: event.max_players,
        estimated_cost: Number(event.estimated_cost),
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Edit Event (Admin View)</h1>
                <EventForm
                    userEmail={currentUser.email}
                    initialData={initialData}
                    eventId={event.id}
                    isEditMode={true}
                />
            </div>
        </div>
    );
}
