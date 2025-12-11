'use client';

import { useState } from 'react';

export default function MockHRMS() {
    const [apiKey, setApiKey] = useState('');
    const [formData, setFormData] = useState({
        employee_name: '',
        employee_email: '',
        opt_in: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/v1/corporate/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    api_key: apiKey,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Webhook failed');
            }

            setMessage('Employee Onboarded Successfully! Webhook sent.');
            setFormData({ employee_name: '', employee_email: '', opt_in: false });
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-100 rounded-xl border border-gray-300">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Workday</h1>
                <p className="text-gray-500">New Employee Onboarding (Simulation)</p>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <label className="block text-sm font-medium text-yellow-800 mb-1">Configuration (Demo Only)</label>
                <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste API Key from Corporate Setup"
                    className="block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.employee_name}
                            onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Corporate Email</label>
                        <input
                            type="email"
                            required
                            value={formData.employee_email}
                            onChange={(e) => setFormData({ ...formData, employee_email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits & Perks</h3>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="opt_in"
                                name="opt_in"
                                type="checkbox"
                                checked={formData.opt_in}
                                onChange={(e) => setFormData({ ...formData, opt_in: e.target.checked })}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="opt_in" className="font-medium text-gray-700">
                                Join "After Hours" Sports Club
                            </label>
                            <p className="text-gray-500">
                                Connect with colleagues for sports and activities. By checking this, you agree to share your name and email with the After Hours platform.
                            </p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !apiKey}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Complete Onboarding'}
                </button>
            </form>
        </div>
    );
}
