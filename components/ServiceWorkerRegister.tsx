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
                .then(registration => {
                    console.log('SW Registered:', registration.scope);
                })
                .catch(err => {
                    console.error('SW Registration failed:', err);
                });
        }
    }, []);

    return null;
}
