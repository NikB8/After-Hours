'use client';

import { useState } from 'react';
import ShareButtons from './ShareButtons';

type RecommendationFormProps = {
    eventId?: string;
    eventTitle?: string;
    userEmail: string;
};

export default function RecommendationForm({ eventId, eventTitle = 'Game', userEmail }: RecommendationFormProps) {
    return (
        <div className="bg-card p-8 rounded-2xl shadow-lg border border-border mt-8">
            <h3 className="text-xl font-bold text-foreground mb-6">
                {eventId ? 'Invite a Friend to this Game' : 'Recommend a Friend'}
            </h3>

            <div className="space-y-5">
                {/* Direct Share Options */}
                {eventId && (
                    <div className="pt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Share link via</p>
                        <ShareButtons eventId={eventId} eventTitle={eventTitle} />
                    </div>
                )}
            </div>
        </div>
    );
}
