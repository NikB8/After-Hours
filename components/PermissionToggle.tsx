'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PermissionToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        setLoading(true);
        try {
            if (!('serviceWorker' in navigator)) return;

            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                console.error('VAPID Public Key missing');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Send to backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            setIsSubscribed(true);
            showToast('Push notifications enabled!', 'success');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            showToast('Failed to enable notifications. Check permissions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    {isSubscribed ? <Bell className="w-5 h-5 text-green-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                    Push Notifications
                </h3>
                <p className="text-sm text-gray-500">
                    {isSubscribed ? 'You are receiving notifications.' : 'Enable notifications to stay updated.'}
                </p>
            </div>
            <button
                onClick={subscribeUser}
                disabled={isSubscribed || loading}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSubscribed
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
            >
                {loading ? 'Processing...' : (isSubscribed ? 'Enabled' : 'Enable')}
            </button>
        </div>
    );
}
