'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator && (window as any).workbox !== undefined) {
            // Next.js PWA plugins might handle this, but if we are doing manual VAPID:
        }

        // Manual registration for our sw.js
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(async (registration) => {
                    console.log('SW Registered:', registration.scope);
                    // AUTO-ENABLE PUSH NOTIFICATIONS
                    // This will trigger the permission prompt immediately if permission is 'default'
                    // Or sync if 'granted'.
                    const { subscribeToPush } = await import('@/lib/pushRegistration');
                    subscribeToPush().catch(err => console.error('Auto-subscribe failed:', err));
                })
                .catch(err => {
                    console.error('SW Registration failed:', err);
                });
        }
    }, []);

    return null;
}
