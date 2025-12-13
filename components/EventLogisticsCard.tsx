'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Car, Info } from 'lucide-react';

type LogisticsData = {
    venue_name: string;
    map_link: string;
    drivers: any[];
    riders: any[];
    independent: any[];
};

type EventLogisticsCardProps = {
    eventId: string;
    userEmail: string;
    userStatus: string;
};

export default function EventLogisticsCard({ eventId, userEmail, userStatus }: EventLogisticsCardProps) {
    const router = useRouter();
    const [data, setData] = useState<LogisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form state
    const [mode, setMode] = useState('Independent');
    const [seats, setSeats] = useState(0);
    const [pickup, setPickup] = useState('');

    useEffect(() => {
        if (userStatus !== 'Confirmed') {
            setLoading(false);
            return;
        }

        const fetchLogistics = async () => {
            try {
                const res = await fetch(`/api/v1/events/${eventId}/logistics`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);

                    // Pre-fill user's current choice
                    const allParticipants = [...json.drivers, ...json.riders, ...json.independent];
                    const me = allParticipants.find((p: any) => p.user.email === userEmail);
                    if (me) {
                        setMode(me.transport_mode);
                        setSeats(me.car_seats || 0);
                        setPickup(me.pickup_location || '');
                    }
                }
            } catch (error) {
                console.error('Error loading logistics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogistics();
    }, [eventId, userStatus, userEmail]);

    const handleUpdate = async () => {
        setUpdateLoading(true);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/logistics`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    transport_mode: mode,
                    car_seats: seats,
                    pickup_location: pickup
                })
            });

            if (res.ok) {
                // Refresh data
                const updatedRes = await fetch(`/api/v1/events/${eventId}/logistics`);
                const json = await updatedRes.json();
                setData(json);
                router.refresh();
            }
        } catch (error) {
            console.error('Error updating transport', error);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (userStatus !== 'Confirmed') return null;
    if (loading) return <div className="p-4 bg-gray-50 rounded-lg animate-pulse h-32"></div>;
    if (!data) return null;

    const isVirtual = data.venue_name.toLowerCase().includes('online') ||
        data.venue_name.toLowerCase().includes('virtual') ||
        data.map_link.toLowerCase().includes('zoom');

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Event Logistics</h3>
            </div>

            {/* Location Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold uppercase tracking-wider mb-1">Venue</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">{data.venue_name}</span>
                    <a
                        href={data.map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
                    >
                        {isVirtual ? 'Join Meeting' : 'View Location'}
                    </a>
                </div>
            </div>

            {/* Transport Section - Hidden if Virtual */}
            {!isVirtual && (
                <div>
                    <div className="flex items-center gap-2 mb-4 border-t pt-6">
                        <Car className="text-gray-600" />
                        <h4 className="text-md font-semibold text-gray-800">Transport Coordination</h4>
                    </div>

                    {/* Transport Update Form */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">How are you getting there?</label>
                        <div className="flex flex-col gap-3">
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white border"
                            >
                                <option value="Independent">I'm going independently</option>
                                <option value="Driver">I'm driving (Carpool Offer)</option>
                                <option value="Rider">I need a ride</option>
                            </select>

                            {mode === 'Driver' && (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Seats"
                                        min="0"
                                        value={seats}
                                        onChange={(e) => setSeats(parseInt(e.target.value))}
                                        className="w-20 rounded-md border-gray-300 shadow-sm p-2 border"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pickup Area (opt)"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleUpdate}
                                disabled={updateLoading}
                                className="self-start px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                            >
                                {updateLoading ? 'Updating...' : 'Update My Status'}
                            </button>
                        </div>
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TransportList title="Drivers 🚗" items={data.drivers} showSeats />
                        <TransportList title="Riders 🙋‍♂️" items={data.riders} />
                        <TransportList title="Independent 🚶" items={data.independent} />
                    </div>
                </div>
            )}

            {isVirtual && (
                <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                    <Info className="w-4 h-4" />
                    <span>This is a virtual event. Transport details are hidden.</span>
                </div>
            )}
        </div>
    );
}

function TransportList({ title, items, showSeats }: { title: string, items: any[], showSeats?: boolean }) {
    if (items.length === 0) return null;
    return (
        <div className="border rounded-md p-3">
            <h5 className="font-semibold text-gray-700 mb-2 border-b pb-1 text-sm">{title}</h5>
            <ul className="space-y-2">
                {items.map((p, idx) => (
                    <li key={idx} className="text-sm flex flex-col">
                        <span className="font-medium text-gray-900">{p.user_name}</span>
                        {showSeats && (
                            <span className="text-xs text-green-600">{p.car_seats} seats avail {p.pickup_location ? `• ${p.pickup_location}` : ''}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
