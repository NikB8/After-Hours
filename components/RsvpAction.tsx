'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RsvpActionProps = {
    eventId: string;
    maxPlayers: number;
    confirmedCount: number;
    userStatus: 'Confirmed' | 'Waitlist' | 'Declined' | 'None';
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

    const handleJoin = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`/api/v1/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: userEmail }),
            });

            if (!res.ok) throw new Error('Failed to join');

            const data = await res.json();
            setStatus(data.status); // 'Confirmed' or 'Waitlist'
            router.refresh(); // Refresh server components to update counts
        } catch (error) {
            setMessage('Error joining event');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`/api/v1/events/${eventId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: userEmail }),
            });

            if (!res.ok) throw new Error('Failed to leave');

            setStatus('Declined');
            router.refresh();
        } catch (error) {
            setMessage('Error leaving event');
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

                <div className="flex gap-3">
                    {(status === 'None' || status === 'Declined') && (
                        <button
                            onClick={handleJoin}
                            disabled={loading}
                            className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${isFull ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                                } disabled:opacity-50`}
                        >
                            {loading ? 'Processing...' : isFull ? 'Join Waitlist' : 'Join Game'}
                        </button>
                    )}

                    {(status === 'Confirmed' || status === 'Waitlist') && (
                        <button
                            onClick={handleLeave}
                            disabled={loading}
                            className="flex-1 py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Leave Game'}
                        </button>
                    )}
                </div>

                {message && <p className="text-sm text-red-600 text-center">{message}</p>}
            </div>
        </div>
    );
}
