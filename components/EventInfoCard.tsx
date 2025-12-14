'use client';

import ShareButtons from '@/components/ShareButtons';

type EventInfoCardProps = {
    event: {
        id: string;
        sport: string;
        venue_name: string;
        map_link: string;
        status: string;
        start_time: Date | string;
        end_time?: Date | string | null;
        estimated_cost: any;
        organizer: {
            email: string;
        };
    };
};

export default function EventInfoCard({ event }: EventInfoCardProps) {
    const startDate = new Date(event.start_time);
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const startTimeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let timeRange = startTimeStr;
    if (event.end_time) {
        const endDate = new Date(event.end_time);
        const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        timeRange = `${startTimeStr} - ${endTimeStr}`;
    }

    return (
        <div className="bg-card rounded-xl shadow-md overflow-hidden p-8 border border-border">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{event.sport} Game</h1>
                    <p className="mt-2 text-muted-foreground flex items-center">
                        <span className="mr-2">📍</span>
                        <a href={event.map_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {event.venue_name}
                        </a>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ShareButtons eventId={event.id} eventTitle={`${event.sport} on ${dateStr}`} />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === 'Open' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}>
                        {event.status}
                    </span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Time</h3>
                        <p className="mt-1 text-lg text-foreground">
                            {dateStr}
                        </p>
                        <p className="text-lg text-foreground font-semibold">
                            {timeRange}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Organizer</h3>
                        <p className="mt-1 text-lg text-foreground">{event.organizer.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                        <p className="mt-1 text-lg text-foreground">₹{event.estimated_cost.toString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
