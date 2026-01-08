'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    useEffect(() => {
        // Initialize PostHog
        if (typeof window !== 'undefined' && !posthog.__loaded) {
            console.log("Initializing PostHog with key:", process.env.NEXT_PUBLIC_POSTHOG_KEY?.slice(0, 5) + "...");
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
                api_host: '/ingest', // Reverse proxy
                ui_host: 'https://eu.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: false, // Manually capture pageviews
                loaded: (posthog) => {
                    console.log("PostHog Loaded Successfully");
                    if (process.env.NODE_ENV === 'development') posthog.debug();
                },
            });
        }
    }, []);

    // Track Page Views
    useEffect(() => {
        if (pathname && posthog.__loaded) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                '$current_url': url,
            });
        }
    }, [pathname, searchParams]);

    // Handle User Identification via Session
    useEffect(() => {
        if (session?.user?.email && posthog.__loaded) {
            // Identify user
            // We use email as distinct_id here, but ideally database ID is better if available and consistent
            // session.user.id isn't always available by default in NextAuth v5 without callback customization
            // Assuming email is unique enough for now, or check if 'id' is in session.
            const userId = (session.user as any).id || session.user.email;

            posthog.identify(userId, {
                email: session.user.email,
                name: session.user.name,
            });
        } else if (!session && posthog.__loaded) {
            // Reset on logout
            // Be careful not to reset on initial load if just waiting for session
            // logic here might need refinement to distinguish "loading" vs "unauthenticated"
            // For now, only reset if we explicitly know there is no session
            posthog.reset();
        }
    }, [session]);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
