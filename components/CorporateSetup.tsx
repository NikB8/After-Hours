'use client';

import { useState } from 'react';

export default function CorporateSetup() {
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        hrms_provider: 'Workday',
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/v1/corporate/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Corporate Partner Registration</h2>

            {!result ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Domain</label>
                        <input
                            type="text"
                            required
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="acme.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">HRMS Provider</label>
                        <select
                            value={formData.hrms_provider}
                            onChange={(e) => setFormData({ ...formData, hrms_provider: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="Workday">Workday</option>
                            <option value="BambooHR">BambooHR</option>
                            <option value="SAP SuccessFactors">SAP SuccessFactors</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register Partner'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <h3 className="text-lg font-medium text-green-900">Registration Successful!</h3>
                        <p className="mt-1 text-sm text-green-700">
                            Your corporate account has been created. Use the credentials below to configure your HRMS webhook.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">API Key</label>
                            <code className="block mt-1 p-2 bg-white border rounded text-sm font-mono break-all">
                                {result.api_key}
                            </code>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Webhook URL</label>
                            <code className="block mt-1 p-2 bg-white border rounded text-sm font-mono break-all">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/corporate/webhook
                            </code>
                        </div>
                    </div>

                    <div className="pt-4">
                        <a
                            href="/corporate/demo-hrms"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Go to Mock HRMS Demo &rarr;
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
