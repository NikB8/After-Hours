'use client';

import { useState } from 'react';
import RsvpAction from '@/components/RsvpAction';
import TransportCoordination from '@/components/TransportCoordination';
import PaymentDueCard from '@/components/PaymentDueCard';

type EventStatusManagerProps = {
    eventId: string;
    maxPlayers: number;
    initialConfirmedCount: number;
    initialUserStatus: 'Confirmed' | 'Waitlist' | 'Declined' | 'Maybe' | 'None' | 'Invited';
    userEmail: string;
    isCompleted: boolean;
    isAdmin: boolean; // if needed for specific logic
};

export default function EventStatusManager({
    eventId,
    maxPlayers,
    initialConfirmedCount,
    initialUserStatus,
    userEmail,
    isCompleted
}: EventStatusManagerProps) {
    const [status, setStatus] = useState(initialUserStatus);
    const [confirmedCount, setConfirmedCount] = useState(initialConfirmedCount);

    const handleStatusChange = (newStatus: any) => {
        // Optimistic Update can be refined here if RsvpAction propagates it up
        // Currently RsvpAction handles its own state, but to make TransportCoordination instant,
        // we need RsvpAction to tell us "I just became Confirmed".

        // This callback is passed to RsvpAction to lift state up immediately
        setStatus(newStatus);

        // Simple optimistic count adjustment (this is a rough approximation)
        if (newStatus === 'Confirmed' && initialUserStatus !== 'Confirmed') {
            setConfirmedCount(prev => prev + 1);
        } else if (newStatus !== 'Confirmed' && initialUserStatus === 'Confirmed') {
            setConfirmedCount(prev => Math.max(0, prev - 1));
        }
    };

    return (
        <>
            {/* Show Expense Tracking if Completed and Confirmed, else show RSVP */}
            {isCompleted && status === 'Confirmed' ? (
                <PaymentDueCard
                    eventId={eventId}
                    userEmail={userEmail}
                />
            ) : (
                <RsvpAction
                    eventId={eventId}
                    maxPlayers={maxPlayers}
                    confirmedCount={confirmedCount}
                    userStatus={status}
                    userEmail={userEmail}
                    onStatusChange={handleStatusChange}
                    isCompleted={isCompleted}
                />
            )}

            {status === 'Confirmed' && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <TransportCoordination
                        eventId={eventId}
                    />
                </div>
            )}
        </>
    );
}
