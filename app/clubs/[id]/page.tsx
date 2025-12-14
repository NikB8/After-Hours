import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findFirst(); // Mock auth

    const club = await prisma.club.findUnique({
        where: { id },
        include: {
            _count: { select: { members: true } },
            members: {
                where: { user_id: user?.id },
            },
            events: {
                where: {
                    start_time: { gte: new Date() },
                },
                orderBy: { start_time: 'asc' },
            },
        },
    });

    if (!club) notFound();

    const isMember = club.members.length > 0;

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-card rounded-xl shadow-md p-8 border border-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-foreground">{club.name}</h1>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {club.category}
                                </span>
                            </div>
                            <p className="mt-4 text-lg text-muted-foreground">{club.description}</p>
                        </div>
                        {!isMember && (
                            <form action={`/api/v1/clubs/${club.id}/join`} method="POST">
                                {/* Note: In a real app we'd use a client component for the join action to handle state */}
                                {/* For this demo, we'll just show a button that would trigger the API */}
                                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 shadow-sm">
                                    Join Club
                                </button>
                            </form>
                        )}
                        {isMember && (
                            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg font-medium border border-green-200 dark:border-green-900/50">
                                ✓ Member
                            </span>
                        )}
                    </div>
                    <div className="mt-6 flex items-center text-muted-foreground">
                        <span className="font-medium">{club._count.members} Members</span>
                        <span className="mx-2">•</span>
                        <span>{club.company_domain} Office</span>
                    </div>
                </div>

                {/* Events Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Upcoming Club Events</h2>
                        {isMember && (
                            <Link href="/events/new" className="text-primary font-medium hover:underline">
                                + Schedule Event
                            </Link>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {club.events.map((event) => (
                            <Link href={`/events/${event.id}`} key={event.id}>
                                <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-all">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-semibold text-foreground">{event.sport}</h3>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(event.start_time).toLocaleDateString()} - {new Date(event.end_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-muted-foreground">{event.venue_name}</p>
                                </div>
                            </Link>
                        ))}
                        {club.events.length === 0 && (
                            <div className="col-span-full bg-card p-8 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                                No upcoming events scheduled for this club.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
