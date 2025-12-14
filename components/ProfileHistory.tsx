'use client';

import { Calendar, MapPin, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';

export default function ProfileHistory({ events }: { events: any[] }) {
    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-orange-600" />
                    Events Attended
                </h3>
            </div>

            <div className="divide-y divide-border">
                {events && events.length > 0 ? (
                    events.map((event) => (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="block p-4 hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{event.sport} Game</h4>
                                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(event.start_time).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {event.venue_name}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        You haven't attended any events yet.
                    </div>
                )}
            </div>
        </div>
    );
}
