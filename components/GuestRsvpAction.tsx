'use client';

import { useState } from 'react';
import AuthPromptModal from './AuthPromptModal';

type GuestRsvpActionProps = {
    eventId: string;
    maxPlayers: number;
    confirmedCount: number;
};

export default function GuestRsvpAction({ eventId, maxPlayers, confirmedCount }: GuestRsvpActionProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">RSVP</h3>
                    <span className="text-sm font-medium text-gray-500">
                        {confirmedCount} / {maxPlayers} Players
                    </span>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-gray-600 text-sm">Join this event to play!</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                    >
                        RSVP to Join
                    </button>
                </div>
            </div>

            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                callbackUrl={`/events/${eventId}`}
            />
        </>
    );
}
