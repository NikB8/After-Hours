'use client';

import { useState, useEffect } from 'react';

type Participant = {
    user: { id: string; email: string };
    transport_mode: string;
    car_seats: number;
    pickup_location?: string;
    assigned_driver_id?: string;
    assigned_driver_email?: string;
};

type LogisticsData = {
    drivers: Participant[];
    riders: Participant[];
    independent: Participant[];
};

export default function CarpoolCoordinator({ eventId, userEmail }: { eventId: string; userEmail: string }) {
    const [data, setData] = useState<LogisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('Independent');
    const [seats, setSeats] = useState(3);
    const [pickup, setPickup] = useState('');
    const [updating, setUpdating] = useState(false);
    const [assigning, setAssigning] = useState<string | null>(null);

    useEffect(() => {
        fetchLogistics();
    }, []);

    const fetchLogistics = async () => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/logistics`);
            const json = await res.json();
            setData(json);

            // Set current user's mode
            const all = [...json.drivers, ...json.riders, ...json.independent];
            const me = all.find((p: any) => p.user.email === userEmail);
            if (me) {
                setMode(me.transport_mode);
                if (me.transport_mode === 'Driver') {
                    setSeats(me.car_seats);
                    setPickup(me.pickup_location || '');
                }
            }
        } catch (error) {
            console.error('Error fetching logistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await fetch(`/api/v1/events/${eventId}/logistics`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    transport_mode: mode,
                    car_seats: seats,
                    pickup_location: pickup,
                }),
            });
            fetchLogistics();
        } catch (error) {
            console.error('Error updating logistics:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAssign = async (riderEmail: string) => {
        setAssigning(riderEmail);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/logistics/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driver_email: userEmail,
                    rider_email: riderEmail,
                }),
            });
            if (res.ok) {
                fetchLogistics();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to assign rider');
            }
        } catch (error) {
            console.error('Error assigning rider:', error);
        } finally {
            setAssigning(null);
        }
    };

    if (loading || !data) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

    // Helper: Get passengers for current user (if driver)
    const myPassengers = data.riders.filter(r => r.assigned_driver_email === userEmail);
    const isDriver = mode === 'Driver';

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Logistics & Carpool</h3>

            {/* User Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">How are you getting there?</label>
                <div className="flex gap-2 mb-4">
                    {['Independent', 'Driver', 'Rider'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border ${mode === m
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {mode === 'Driver' && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Available Seats</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={seats}
                                onChange={(e) => setSeats(parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Pickup Area</label>
                            <input
                                type="text"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                placeholder="e.g. Downtown"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                >
                    {updating ? 'Updating...' : 'Update Status'}
                </button>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                {/* Drivers List */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <span>🚙 Drivers Offering Rides</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{data.drivers.length}</span>
                    </h4>
                    {data.drivers.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                            {data.drivers.map((d, i) => {
                                const passengers = data.riders.filter(r => r.assigned_driver_email === d.user.email);
                                const seatsTaken = passengers.length;
                                const seatsLeft = d.car_seats - seatsTaken;

                                return (
                                    <li key={i} className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{d.user.email}</span>
                                            <span className="text-green-700">
                                                {d.pickup_location ? `📍 ${d.pickup_location}` : ''} • {seatsLeft} seats left
                                            </span>
                                        </div>
                                        {passengers.length > 0 && (
                                            <div className="mt-1 text-xs text-gray-500 pl-2 border-l-2 border-green-200">
                                                Driving: {passengers.map(p => p.user.email).join(', ')}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1 italic">No drivers yet.</p>
                    )}
                </div>

                {/* Riders List */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <span>🙋‍♂️ Needs a Ride</span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">{data.riders.length}</span>
                    </h4>
                    {data.riders.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                            {data.riders.map((r, i) => {
                                const isAssigned = !!r.assigned_driver_email;
                                if (isAssigned) return null; // Don't show assigned riders in the "Needs a Ride" list (optional design choice, or show them differently)

                                return (
                                    <li key={i} className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100 flex justify-between items-center">
                                        <span>{r.user.email}</span>
                                        {isDriver && !isAssigned && (
                                            <button
                                                onClick={() => handleAssign(r.user.email)}
                                                disabled={assigning === r.user.email}
                                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {assigning === r.user.email ? '...' : 'Pick'}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                            {data.riders.every(r => r.assigned_driver_email) && data.riders.length > 0 && (
                                <li className="text-sm text-gray-500 italic">All riders have been assigned!</li>
                            )}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1 italic">No riders yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
