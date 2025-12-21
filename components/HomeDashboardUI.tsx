'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EventCard, { EventCardProps } from './EventCard';
import EventSkeleton from './EventSkeleton';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function HomeDashboardUI({ userName }: { userName: string }) {
    const [events, setEvents] = useState<EventCardProps['event'][]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/v1/users/me/upcoming_events');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error('Failed to load dashboard events', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 w-full overflow-hidden">
                <div className="text-left w-full">
                    <h2 className="text-3xl font-bold text-foreground break-words">Welcome back, {userName}! 👋</h2>
                    <p className="text-muted-foreground mt-1 break-words">Here is your upcoming schedule.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Link href="/events/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition shadow-sm whitespace-nowrap text-center w-full sm:w-auto">
                        + Create Event
                    </Link>
                </div>
            </div>

            {/* Events Feed */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-foreground">Upcoming Events</h3>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <EventSkeleton key={i} />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
                        <p className="text-muted-foreground mb-6">You haven't joined or hosted any events coming up soon.</p>
                        <Link href="/events/new" className="text-primary font-medium hover:underline">
                            Host your first event
                        </Link>
                    </div>
                ) : (
                    <div className="snap-container flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible">
                        {events.map((event) => (
                            <div key={event.id} className="event-card snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink">
                                <EventCard event={event} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
