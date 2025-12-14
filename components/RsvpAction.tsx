'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import TransportSelectionModal from '@/components/TransportSelectionModal';

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

    const [showModal, setShowModal] = useState(false);

    const handleUpdateStatus = async (newStatus: 'Confirmed' | 'Maybe' | 'Declined', transportMode?: string, carSeats?: number) => {
        // If clicking "Yes", show modal first (unless we are just calling this from the modal itself)
        if (newStatus === 'Confirmed' && !transportMode) {
            setShowModal(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setShowModal(false);

        try {
            const body: any = {
                user_email: userEmail,
                status: newStatus
            };

            if (newStatus === 'Confirmed') {
                body.transport_mode = transportMode;
                if (transportMode === 'Driver') {
                    body.car_seats = carSeats;
                }
            }

            const res = await fetch(`/api/v1/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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
        <>
            <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">RSVP</h3>
                    <span className="text-sm font-medium text-muted-foreground">
                        {confirmedCount} / {maxPlayers} Players
                    </span>
                </div>

                <div className="space-y-4">
                    {status === 'Confirmed' && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-center font-medium">
                            You are playing! 🏸
                        </div>
                    )}
                    {status === 'Waitlist' && (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-md text-center font-medium">
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
                                : 'bg-background text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
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
                                : 'bg-background text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
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
                                : 'bg-background text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                                } disabled:opacity-50`}
                        >
                            {loading && status === 'Declined' ? '...' : "No, Can't"}
                        </button>
                    </div>

                    {message && <p className="text-sm text-destructive text-center">{message}</p>}
                </div>
            </div>

            <TransportSelectionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={(mode, seats) => handleUpdateStatus('Confirmed', mode, seats)}
                loading={loading}
            />
        </>
    );
}
