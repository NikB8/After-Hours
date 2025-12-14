'use client';

import { useEffect, useState } from 'react';
import { Car, Users, MapPin, UserCheck, AlertCircle } from 'lucide-react';

interface TransportParticipant {
    id: string;
    user_name: string;
    transport_mode: 'Driver' | 'Rider' | 'Independent';
    car_seats: number;
    user_image?: string;
}

export default function TransportCoordination({ eventId }: { eventId: string }) {
    const [participants, setParticipants] = useState<TransportParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransportData = async () => {
            try {
                const res = await fetch(`/api/v1/events/${eventId}/transport_coordination`);
                if (!res.ok) {
                    if (res.status === 403) {
                        setError('Join the event to see coordination details.');
                    }
                    return;
                }
                const data = await res.json();
                setParticipants(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransportData();
    }, [eventId]);

    if (error) return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
            <Car className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>{error}</p>
        </div>
    );

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl"></div>;

    const drivers = participants.filter(p => p.transport_mode === 'Driver');
    const riders = participants.filter(p => p.transport_mode === 'Rider');
    const independent = participants.filter(p => p.transport_mode === 'Independent');

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    Transport Coordination
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                    {participants.length} Confirmed
                </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Drivers */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Car className="w-3 h-3" /> Drivers ({drivers.length})
                    </h4>
                    {drivers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No drivers yet</p>
                    ) : (
                        <div className="space-y-2">
                            {drivers.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-2.5 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <span className="text-sm font-medium text-foreground truncate max-w-[100px]" title={d.user_name}>{d.user_name}</span>
                                    <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {d.car_seats} seats
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2: Riders */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Needs Ride ({riders.length})
                    </h4>
                    {riders.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No requestors</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {riders.map(r => (
                                <span key={r.id} className="text-xs px-2.5 py-1.5 bg-muted text-foreground rounded-md border border-border">
                                    {r.user_name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 3: Independent */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3" /> Reaching Self ({independent.length})
                    </h4>
                    {independent.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">None</p>
                    ) : (
                        <div className="text-xs text-muted-foreground space-y-1">
                            {independent.map(i => (
                                <div key={i.id} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                                    <span>{i.user_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
