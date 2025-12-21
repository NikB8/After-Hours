'use client';

import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function NotificationTest() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const triggerTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications/test', {
                method: 'POST',
            });
            if (res.ok) {
                showToast('Test notification sent!', 'success');
            } else {
                showToast('Failed to send test', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Test Notification</h3>
            <p className="text-sm text-gray-500 mb-4">Click to receive a test push notification (if enabled).</p>
            <button
                onClick={triggerTest}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
                <BellRing size={16} />
                {loading ? 'Sending...' : 'Send Test Push'}
            </button>
        </div>
    );
}
