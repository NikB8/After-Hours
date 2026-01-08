'use client';

import { useFeatureFlagEnabled, useFeatureFlagVariantKey } from 'posthog-js/react';
import posthog from 'posthog-js';
import { useState } from 'react';

export default function TestAnalyticsPage() {
    const isNewFeatureEnabled = useFeatureFlagEnabled('test-flag');
    const experimentVariant = useFeatureFlagVariantKey('test-experiment');
    const [eventStatus, setEventStatus] = useState('');

    const triggerEvent = () => {
        posthog.capture('test_event_clicked', { timestamp: new Date().toISOString() });
        setEventStatus('Event Triggered! Check PostHog "Events" tab.');
    };

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">PostHog Analytics Test</h1>

            {/* Feature Flags */}
            <div className="p-6 border rounded-xl bg-card">
                <h2 className="text-xl font-semibold mb-4">Feature Flags & Experiments</h2>
                <div className="space-y-2">
                    <p>
                        <strong>Test Flag Status:</strong>{' '}
                        <span className={isNewFeatureEnabled ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {isNewFeatureEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                    </p>
                    <p>
                        <strong>Experiment Variant:</strong>{' '}
                        <code className="bg-muted px-2 py-1 rounded">
                            {experimentVariant ? String(experimentVariant) : 'Loading/None'}
                        </code>
                    </p>
                </div>
            </div>

            {/* Event Trigger */}
            <div className="p-6 border rounded-xl bg-card">
                <h2 className="text-xl font-semibold mb-4">Event Capture</h2>
                <div className="flex gap-4">
                    <button
                        onClick={triggerEvent}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Trigger Client-Side Event
                    </button>
                    <button
                        onClick={async () => {
                            setEventStatus('Triggering Server-Side Event...');
                            try {
                                const res = await fetch('/api/test-analytics', { method: 'POST' });
                                const data = await res.json();
                                if (data.success) {
                                    setEventStatus('Server-Side Event Triggered! Check PostHog.');
                                } else {
                                    setEventStatus('Failed to trigger Server-Side Event.');
                                }
                            } catch (e) {
                                setEventStatus('Error triggering request.');
                            }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                        Trigger Server-Side Event
                    </button>
                </div>
                {eventStatus && (
                    <p className="mt-4 text-sm text-green-600 font-medium animate-in fade-in">
                        {eventStatus}
                    </p>
                )}
            </div>

            {/* Privacy Check */}
            <div className="p-6 border rounded-xl bg-card">
                <h2 className="text-xl font-semibold mb-4">Session Recording Privacy</h2>
                <p className="mb-2">The text below should be blurred in session replays:</p>
                <div className="ph-no-capture p-4 bg-muted rounded text-lg font-mono">
                    SENSITIVE DATA (Credit Card: 4242...)
                </div>
            </div>
        </div>
    );
}
