'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushSettingsToggle() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check support and current status
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);

            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setIsSubscribed(!!subscription);
                    setIsLoading(false);
                });
            }).catch(err => {
                console.error("SW not ready or failed", err);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleToggle = async () => {
        if (!isSupported) return;
        setIsLoading(true);

        try {
            if (isSubscribed) {
                // Unsubscribe
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    // TODO: Optionally call API to delete from DB, though our logic handles 410s automatically
                }
                setIsSubscribed(false);
            } else {
                // Subscribe
                const registration = await navigator.serviceWorker.register('/sw.js');

                // Wait for service worker to be active
                await navigator.serviceWorker.ready;

                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    throw new Error('VAPID Public Key not found');
                }

                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                // Send to API
                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ subscription }),
                });

                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error toggling push notifications:', error);
            alert('Failed to update push notification settings. Check console/permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="text-sm text-gray-500">
                Push notifications are not supported by your browser.
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="space-y-0.5">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Push Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive alerts about RSVPs, payments, and invites instantly.
                </p>
            </div>

            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isSubscribed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                role="switch"
                aria-checked={isSubscribed}
            >
                <span className="sr-only">Enable notifications</span>
                <span
                    className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}
          `}
                >
                    {isLoading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        </span>
                    )}
                </span>
            </button>
        </div>
    );
}
