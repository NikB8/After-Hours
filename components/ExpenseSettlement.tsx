'use client';

import { useState, useEffect } from 'react';

type Participant = {
    id: string;
    user: { email: string };
    amount_due: number;
    is_paid: boolean;
    paid_by_email?: string;
};

export default function ExpenseSettlement({ eventId, userEmail, isOrganizer }: { eventId: string; userEmail: string; isOrganizer: boolean }) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [actualCost, setActualCost] = useState<string>('');
    const [calculating, setCalculating] = useState(false);
    const [payingFor, setPayingFor] = useState<string | null>(null); // Participant ID being paid for
    const [proxyEmail, setProxyEmail] = useState<string>(''); // Email of the person paying

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            // Re-using logistics endpoint again as it has participant data
            // Ideally we'd have a dedicated endpoint or include this in the main event fetch
            const res = await fetch(`/ api / v1 / events / ${eventId}/logistics`);
            const data = await res.json();
            const all = [...data.drivers, ...data.riders, ...data.independent];
            // Deduplicate
            const unique = Array.from(new Map(all.map((p: any) => [p.id, p])).values()) as Participant[];
            setParticipants(unique);
        } catch (error) {
            console.error('Error fetching participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        if (!actualCost) return;
        setCalculating(true);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/finance/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    actual_cost: actualCost,
                }),
            });
            if (res.ok) {
                fetchParticipants(); // Refresh to see updated amounts
                alert('Costs calculated and split!');
            } else {
                alert('Failed to calculate costs');
            }
        } catch (error) {
            console.error('Error calculating costs:', error);
        } finally {
            setCalculating(false);
        }
    };

    const handlePayment = async (participantId: string, isPaid: boolean, payerEmail?: string) => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/finance/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    participant_id: participantId,
                    is_paid: isPaid,
                    paid_by_email: payerEmail,
                }),
            });
            if (res.ok) {
                fetchParticipants(); // Refresh to get updated paid_by info
                setPayingFor(null);
                setProxyEmail('');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

    const myParticipant = participants.find((p) => p.user.email === userEmail);

    // Calculate Totals
    const totalDue = participants.reduce((sum, p) => sum + Number(p.amount_due), 0);
    const totalCollected = participants.filter(p => p.is_paid).reduce((sum, p) => sum + Number(p.amount_due), 0);
    const remaining = totalDue - totalCollected;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Expense Settlement</h3>

            {isOrganizer ? (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase font-semibold">Total Cost</div>
                            <div className="text-lg font-bold text-gray-900">${totalDue.toFixed(2)}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-xs text-green-600 uppercase font-semibold">Collected</div>
                            <div className="text-lg font-bold text-green-700">${totalCollected.toFixed(2)}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-xs text-red-600 uppercase font-semibold">Remaining</div>
                            <div className="text-lg font-bold text-red-700">${remaining.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Set Actual Cost</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={actualCost}
                                onChange={(e) => setActualCost(e.target.value)}
                                placeholder="0.00"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                            />
                            <button
                                onClick={handleCalculate}
                                disabled={calculating || !actualCost}
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                            >
                                {calculating ? 'Splitting...' : 'Split Cost'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                        <ul className="divide-y divide-gray-100">
                            {participants.map((p) => (
                                <li key={p.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{p.user.email}</span>
                                        <div className="text-xs text-gray-500">Due: ${Number(p.amount_due).toFixed(2)}</div>
                                        {p.is_paid && p.paid_by_email && p.paid_by_email !== p.user.email && (
                                            <div className="text-xs text-blue-600">Paid by {p.paid_by_email}</div>
                                        )}
                                    </div>

                                    {payingFor === p.id ? (
                                        <div className="flex gap-2 items-center">
                                            <select
                                                className="text-xs border rounded p-1"
                                                value={proxyEmail}
                                                onChange={(e) => setProxyEmail(e.target.value)}
                                            >
                                                <option value="">Paid by Self</option>
                                                {participants.filter(u => u.user.email !== p.user.email).map(u => (
                                                    <option key={u.id} value={u.user.email}>{u.user.email}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handlePayment(p.id, true, proxyEmail || undefined)}
                                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setPayingFor(null)}
                                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (p.is_paid) {
                                                    handlePayment(p.id, false);
                                                } else {
                                                    setPayingFor(p.id);
                                                    setProxyEmail('');
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${p.is_paid
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                        >
                                            {p.is_paid ? 'Paid' : 'Mark Paid'}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    {myParticipant ? (
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Your Share</div>
                            <div className="text-3xl font-bold text-gray-900 mb-4">${Number(myParticipant.amount_due).toFixed(2)}</div>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${myParticipant.is_paid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {myParticipant.is_paid ? '✅ Paid' : '⏳ Payment Pending'}
                            </span>
                            {!myParticipant.is_paid && Number(myParticipant.amount_due) > 0 && (
                                <p className="mt-4 text-xs text-gray-500">Please pay the organizer directly.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">You are not a participant in this event.</p>
                    )}
                </div>
            )}
        </div>
    );
}
