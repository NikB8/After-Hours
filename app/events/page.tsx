'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus } from 'lucide-react';
import EventCard from '@/components/EventCard';

type Event = {
    id: string;
    sport: string; // The "Title"
    start_time: string;
    end_time: string;
    venue_name: string; // The "Location"
    organizer: { email: string };
    _count: { participants: number };
    status: string;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/v1/events'); // Fetches all
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const now = new Date();
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);

        if (filter === 'upcoming') {
            return eventDate >= now;
        } else {
            // PAST EVENTS LOGIC:
            // Only show if user was a 'Participant' (Confirmed) or 'Invited' (or Organizer)
            // 'Organizer' status sets currentUserStatus = 'Organizer' in API transformation
            const interacted = ['Confirmed', 'Invited', 'Organizer', 'Waitlist'].includes(event.status); // event.status mapped to currentUserStatus in API

            return eventDate < now && interacted;
        }
    });

    // Sort logic: Upcoming = Ascending, Past = Descending
    filteredEvents.sort((a, b) => {
        const dateA = new Date(a.start_time).getTime();
        const dateB = new Date(b.start_time).getTime();
        return filter === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    if (loading) return (
        <div className="max-w-4xl mx-auto p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-foreground">Events</h1>
                <Link
                    href="/events/new"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                >
                    <Plus size={20} />
                    Create Event
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'upcoming'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'past'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Past Events
                </button>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4 font-medium">No {filter} events found.</p>
                    {filter === 'upcoming' && (
                        <Link href="/events/new" className="text-primary font-medium hover:underline">
                            Plan something fun!
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        return (
                            <div key={event.id} className="h-full">
                                <EventCard
                                    event={{
                                        id: event.id,
                                        title: event.sport,
                                        sport: event.sport,
                                        start_time: event.start_time,
                                        end_time: event.end_time,
                                        venue_name: event.venue_name,
                                        organizer_name: event.organizer.email || 'Organizer',
                                        currentUserStatus: event.status,
                                        confirmedCount: event._count.participants,
                                        max_players: 0 // Not available in list API yet, but needed for prop
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
