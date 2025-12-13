
'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminFinancePage() {
    // Ideally we'd have a specific list-debtors API, but we can reuse /admin/users or a new endpoint. 
    // For simplicity given the scope, I'll create a lightweight fetch here or assume we have a way to get debtors.
    // Actually, I'll implement a simplified fetch logic or mock it if no specific list endpoint exists.
    // Wait, I can fetch *all* users and filter client side for MVP, or better, add a query param to users endpoint.
    // For now, I will use a placeholder or assume a new endpoint /api/v1/admin/finance/outstanding should be created? 
    // The prompt just said "Table view...". I'll mock the hook for "fetchDebtors" to speed up, or better yet,
    // I will quickly assume we need `GET /api/v1/admin/finance/outstanding` or similar. 
    // To save time/calls, I'll just use the `financial_summary` hook or similar? No that's aggregate.
    // I will create a quick client-side fetch helper that calls `prisma.participant.findMany` ... 
    // Actually, I should probably create a quick route `GET /api/v1/admin/finance/outstanding`.

    // DECISION: I will implement a quick server action or route inside this step if possible, 
    // but since I'm in "Frontend" mode, I'll write the page to hit `/api/v1/admin/finance/outstanding` 
    // and I'll create that route in the same step (next tool call).

    const [debtors, setDebtors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOutstanding();
    }, []);

    const fetchOutstanding = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/finance/outstanding');
            if (res.ok) {
                setDebtors(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOverride = async (participantId: string) => {
        if (!confirm("CONFIRM: Mark this debt as PAID? This action will be logged.")) return;

        try {
            const res = await fetch('/api/v1/admin/finance/override_paid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participant_id: participantId })
            });

            if (res.ok) {
                alert("Payment Overridden. Check Audit Log.");
                fetchOutstanding();
            } else {
                alert("Failed to override.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Financial Reconciliation</h1>
            <p className="text-gray-600">Review outstanding debts and manually override status if needed.</p>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Amount Due</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : debtors.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-green-600 font-medium">No outstanding debts found!</td></tr>
                        ) : debtors.map((debt) => (
                            <tr key={debt.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {debt.user.email} <br />
                                    <span className="text-xs text-gray-500">{debt.user.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {debt.event.sport} <br />
                                    <span className="text-xs">{new Date(debt.event.start_time).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                    ₹{debt.amount_due}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button
                                        onClick={() => handleOverride(debt.id)}
                                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-200"
                                    >
                                        Mark Paid
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
