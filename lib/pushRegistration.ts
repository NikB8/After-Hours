'use client';

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

export async function subscribeToPush(): Promise<{ success: boolean; message?: string }> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false, message: 'Push not supported' };
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
            console.error('VAPID Public Key missing');
            return { success: false, message: 'VAPID Key missing' };
        }

        // Check if already subscribed to avoid unnecessary prompts/calls?
        // Actually, calling subscribe() again with same key gives the existing one usually,
        // but explicit check is nicer.
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });
        }

        // Always send to backend to ensure it's synced (e.g. if user logged in on new device but same browser profile?)
        // Or if backend DB was wiped.
        await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to subscribe:', error);
        return { success: false, message: String(error) };
    }
}
