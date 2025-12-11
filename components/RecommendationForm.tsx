'use client';

import { useState } from 'react';

type RecommendationFormProps = {
    eventId?: string;
    userEmail: string; // Mock auth
};

export default function RecommendationForm({ eventId, userEmail }: RecommendationFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        contact_info: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ wa_link: string; message: string } | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/v1/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    event_id: eventId,
                    recommender_email: userEmail,
                }),
            });

            if (!res.ok) throw new Error('Failed to send recommendation');

            const data = await res.json();
            setResult(data);
            setFormData({ name: '', contact_info: '' }); // Clear form
        } catch (err: any) {
            setError('Error sending recommendation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
                {eventId ? 'Invite a Friend to this Game' : 'Recommend a Friend'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="form-label">Friend's Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="form-label">Contact (Email or Phone)</label>
                    <input
                        type="text"
                        required
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        className="form-input"
                        placeholder="e.g. john@example.com or +1234567890"
                    />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                >
                    {loading ? 'Sending Invite...' : 'Send Invite'}
                </button>
            </form>

            {result && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-3">{result.message}</p>
                    <a
                        href={result.wa_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Share on WhatsApp 💬
                    </a>
                </div>
            )}
        </div>
    );
}
