'use client';

import { useState } from 'react';
import ShareButtons from './ShareButtons';

type RecommendationFormProps = {
    eventId?: string;
    eventTitle?: string; // Add eventTitle prop
    userEmail: string; // Mock auth
};

export default function RecommendationForm({ eventId, eventTitle = 'Game', userEmail }: RecommendationFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        contact_info: '',
    });

    // Form logic is effectively disabled as button is removed, keeping inputs for UI as requested

    return (
        <div className="bg-card p-8 rounded-2xl shadow-lg border border-border mt-8">
            <h3 className="text-xl font-bold text-foreground mb-6">
                {eventId ? 'Invite a Friend to this Game' : 'Recommend a Friend'}
            </h3>

            <div className="space-y-5">
                <div>
                    <label className="form-label">Friend's Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="form-label">Contact (Email or Phone)</label>
                    <input
                        type="text"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        className="form-input"
                        placeholder="e.g. john@example.com or +1234567890"
                    />
                </div>

                {/* Direct Share Options moved to bottom */}
                {eventId && (
                    <div className="pt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Share link via</p>
                        <ShareButtons eventId={eventId} eventTitle={eventTitle} />
                    </div>
                )}
            </div>
        </div>
    );
}
