'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Plus, Clock } from 'lucide-react';

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
            return eventDate < now;
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
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <Link
                    href="/events/new"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                >
                    <Plus size={20} />
                    Create Event
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'upcoming'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'past'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Past Events
                </button>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4 font-medium">No {filter} events found.</p>
                    {filter === 'upcoming' && (
                        <Link href="/events/new" className="text-green-600 font-medium hover:underline">
                            Plan something fun!
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredEvents.map((event) => {
                        const startDate = new Date(event.start_time);
                        return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            {/* Header: Title & Status */}
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {event.sport}
                                                </h2>
                                                {event.status === 'Draft' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">Draft</span>}
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">
                                                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span>•</span>
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{event.venue_name}</span>
                                                </div>

                                                <div className="flex items-center gap-2 sm:col-span-2 mt-1">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <span className="text-blue-600 font-medium">
                                                        {event._count.participants} Members Going
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Organizer Avatar/Initials */}
                                        <div className="flex flex-col items-end">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold" title={`Organizer: ${event.organizer.email}`}>
                                                {event.organizer.email[0].toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
