'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
    organizer: { email: string };
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/v1/events');
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

    if (loading) return <div className="p-8 text-center animate-pulse">Loading upcoming events...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
                <Link
                    href="/events/new"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    + Create Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No upcoming events found.</p>
                    <Link href="/events/new" className="text-green-600 font-medium hover:underline">
                        Be the first to create one!
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`}>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                                        <p className="text-gray-600 mb-1">📅 {new Date(event.date).toLocaleString()}</p>
                                        <p className="text-gray-600">📍 {event.location}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        By {event.organizer.email}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
