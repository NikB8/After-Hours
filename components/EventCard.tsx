'use client';

import Link from 'next/link';
import { Calendar, MapPin, User, Users } from 'lucide-react';

export type EventCardProps = {
    event: {
        id: string;
        title: string;
        sport: string;
        start_time: string | Date;
        end_time?: string | Date;
        venue_name: string;
        organizer_name: string;
        currentUserStatus: string;
        confirmedCount: number;
        max_players: number;
    };
};

export default function EventCard({ event }: EventCardProps) {
    const isOrganizer = event.currentUserStatus === 'Organizer';
    const startDate = new Date(event.start_time);

    // Format: "Mon, Dec 15" -> "Mon"
    const dayStr = startDate.toLocaleDateString('en-US', { weekday: 'short' });

    const startTimeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const timeRange = startTimeStr;
    // User requested only start time
    /* if (event.end_time) {
        const endDate = new Date(event.end_time);
        const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        timeRange = `${startTimeStr} - ${endTimeStr}`;
    } */

    let statusBadgeColor = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300';
    let statusText = event.currentUserStatus;

    if (isOrganizer) {
        statusBadgeColor = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
        statusText = 'Hosting';
    } else if (event.currentUserStatus === 'Confirmed') {
        statusBadgeColor = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        statusText = 'Confirmed';
    } else if (event.currentUserStatus === 'Waitlist') {
        statusBadgeColor = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    } else if (event.currentUserStatus === 'Maybe') {
        statusBadgeColor = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    } else if (event.currentUserStatus === 'Invited') {
        statusBadgeColor = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        statusText = 'Pending Invite';
    }

    return (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-start">
                <div>
                    <span className="block text-base font-bold uppercase tracking-wider text-primary">
                        {event.sport}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold">{startDate.getDate()}</div>
                    <div className="text-xs font-medium text-muted-foreground uppercase">{startDate.toLocaleString('default', { month: 'short' })}</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{dayStr} • {timeRange}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate" title={event.venue_name}>{event.venue_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="truncate">By {event.organizer_name}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit ${statusBadgeColor}`}>
                        {statusText}
                    </span>
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 pl-0.5">
                        <Users className="w-3 h-3" />
                        {event.confirmedCount} / {event.max_players}
                    </div>
                </div>

                <Link
                    href={`/events/${event.id}`}
                    className="ml-auto px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors shadow-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
