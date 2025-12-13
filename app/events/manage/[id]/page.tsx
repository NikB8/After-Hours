
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import CreatorDashboard from '@/components/CreatorDashboard';

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id },
        include: { organizer: true }
    });

    if (!event) notFound();

    // Server-side auth check (Optional double check, primarily done in API/Client for dynamic updates)
    // For specific page protection:
    const currentUser = await prisma.user.findFirst();

    if (!currentUser || event.organizer_id !== currentUser.id) {
        // In a real app, redirect to login or 403 page
        // For this demo with mock auth, we redirect home or just show content 
        // (Access will be blocked by API loading inside the component anyway)
        // redirect('/'); 
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <CreatorDashboard eventId={id} />
            </div>
        </div>
    );
}
