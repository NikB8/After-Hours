
import { NextResponse } from 'next/server';
import PostHogClient from '@/lib/posthog';

export async function POST() {
    const posthog = PostHogClient();

    try {
        posthog.capture({
            distinctId: 'server_test_user_123',
            event: 'server_side_event_triggered',
            properties: {
                source: 'api_route',
                timestamp: new Date().toISOString(),
            },
        });

        // Ensure events are flushed before the function exits (critical for serverless)
        await posthog.shutdown();

        return NextResponse.json({ success: true, message: 'Server-side event captured' });
    } catch (error) {
        console.error('PostHog Server Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to capture event' }, { status: 500 });
    }
}
