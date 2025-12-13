'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RsvpActionProps = {
    eventId: string;
    maxPlayers: number;
    confirmedCount: number;
    userStatus: 'Confirmed' | 'Waitlist' | 'Declined' | 'Maybe' | 'None';
    userEmail: string; // Mock auth
};

export default function RsvpAction({
    eventId,
    maxPlayers,
    confirmedCount,
    userStatus: initialStatus,
    userEmail,
}: RsvpActionProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdateStatus = async (newStatus: 'Confirmed' | 'Maybe' | 'Declined') => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`/api/v1/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    status: newStatus
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update status');
            }

            const data = await res.json();
            setStatus(data.status); // 'Confirmed' | 'Waitlist' | 'Maybe' | 'Declined'
            router.refresh();
        } catch (error: any) {
            setMessage(error.message || 'Error updating status');
        } finally {
            setLoading(false);
        }
    };

    const isFull = confirmedCount >= maxPlayers;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">RSVP</h3>
                <span className="text-sm font-medium text-gray-500">
                    {confirmedCount} / {maxPlayers} Players
                </span>
            </div>

            <div className="space-y-4">
                {status === 'Confirmed' && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md text-center font-medium">
                        You are playing! 🏸
                    </div>
                )}
                {status === 'Waitlist' && (
                    <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-center font-medium">
                        You are on the Waitlist ⏳
                    </div>
                )}

                <div className="flex gap-2">
                    {/* Yes Button */}
                    <button
                        onClick={() => handleUpdateStatus('Confirmed')}
                        disabled={loading || (isFull && status !== 'Confirmed')}
                        className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors border ${status === 'Confirmed'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                            } disabled:opacity-50`}
                    >
                        {loading && status === 'Confirmed' ? '...' : (isFull && status !== 'Confirmed' ? 'Waitlist' : "Yes, I'm In!")}
                    </button>

                    {/* Maybe Button */}
                    <button
                        onClick={() => handleUpdateStatus('Maybe')}
                        disabled={loading}
                        className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors border ${status === 'Maybe'
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                            } disabled:opacity-50`}
                    >
                        {loading && status === 'Maybe' ? '...' : 'Maybe'}
                    </button>

                    {/* No Button */}
                    <button
                        onClick={() => handleUpdateStatus('Declined')}
                        disabled={loading}
                        className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors border ${status === 'Declined'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                            } disabled:opacity-50`}
                    >
                        {loading && status === 'Declined' ? '...' : "No, Can't"}
                    </button>
                </div>

                {message && <p className="text-sm text-red-600 text-center">{message}</p>}
            </div>
        </div>
    );
}
