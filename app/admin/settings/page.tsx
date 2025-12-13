
'use client';

import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    // Local state for edits
    const [edits, setEdits] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch('/api/v1/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            });
    }, []);

    const handleSave = async (key: string) => {
        const value = edits[key];
        if (value === undefined) return; // No change

        try {
            const res = await fetch('/api/v1/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                setSettings(prev => ({ ...prev, [key]: value }));
                alert(`Saved ${key}`);
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to render a setting row
    const renderRow = (key: string, label: string) => (
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <p className="text-xs text-gray-500 font-mono">{key}</p>
            </div>
            <div className="flex-1 mx-4">
                <input
                    type="text"
                    className="w-full border rounded-md p-2 font-mono text-sm"
                    value={edits[key] !== undefined ? edits[key] : (settings[key] || '')}
                    onChange={(e) => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Value..."
                />
            </div>
            <button
                onClick={() => handleSave(key)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={edits[key] === undefined || edits[key] === settings[key]}
            >
                <Save className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-8 h-8 text-gray-700" /> Global Platform Settings
            </h1>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {renderRow('platform_fee_rate', 'Platform Fee Rate (Decimal)')}
                    {renderRow('support_email', 'Support Contact Email')}
                    {renderRow('maintenance_mode', 'Maintenance Mode (true/false)')}

                    <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        Note: Adding new keys requires database access or an "Add Key" feature (omitted for MVP).
                    </div>
                </div>
            )}
        </div>
    );
}
