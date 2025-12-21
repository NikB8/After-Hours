'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

import { subscribeToPush } from '@/lib/pushRegistration';

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
        const result = await subscribeToPush();
        if (result.success) {
            setIsSubscribed(true);
            showToast('Push notifications enabled!', 'success');
        } else {
            showToast('Failed to enable notifications: ' + result.message, 'error');
        }
        setLoading(false);
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
