'use client';

import { useState, useEffect } from 'react';

type Participant = {
    id: string;
    user_id: string; // Add user_id to type
    user: { email: string };
    amount_due: number;
    is_paid: boolean;
    paid_by_email?: string;
};

export default function ExpenseSettlement({ eventId, userEmail, userId, isOrganizer }: { eventId: string; userEmail: string; userId: string; isOrganizer: boolean }) {
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
            const res = await fetch(`/api/v1/events/${eventId}/finance/status`);
            const data = await res.json();

            if (data.participants && Array.isArray(data.participants)) {
                setParticipants(data.participants);
                if (data.event?.actual_cost) {
                    setActualCost(data.event.actual_cost.toString());
                }
            } else if (Array.isArray(data)) {
                // Fallback for old API response format just in case
                setParticipants(data);
            } else {
                console.error('Failed to load participants:', data);
                setParticipants([]);
            }
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

    // Robust finding: match by ID if available (preferred), else fallback to email
    const myParticipant = participants.find((p) => p.user_id === userId || p.user.email === userEmail);

    // Calculate Totals
    const totalDue = participants.reduce((sum, p) => sum + Number(p.amount_due), 0);
    const totalCollected = participants.filter(p => p.is_paid).reduce((sum, p) => sum + Number(p.amount_due), 0);
    const remaining = totalDue - totalCollected;

    return (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">💰 Expense Settlement</h3>

            {isOrganizer ? (
                <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg border border-border">
                        <label className="block text-sm font-medium text-foreground mb-2">Set Actual Cost</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={actualCost}
                                onChange={(e) => setActualCost(e.target.value)}
                                placeholder="0.00"
                                className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
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
                        <h4 className="font-medium text-foreground mb-2">Payment Status</h4>
                        <ul className="divide-y divide-border">
                            {participants.map((p) => (
                                <li key={p.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <span className="text-sm font-medium text-foreground">{p.user.email}</span>
                                        <div className="text-xs text-muted-foreground">Due: ₹{Number(p.amount_due).toFixed(2)}</div>
                                        {p.is_paid && p.paid_by_email && p.paid_by_email !== p.user.email && (
                                            <div className="text-xs text-blue-600">Paid by {p.paid_by_email}</div>
                                        )}
                                    </div>

                                    {payingFor === p.id ? (
                                        <div className="flex gap-2 items-center">
                                            <select
                                                className="text-xs border border-input rounded p-1 bg-background text-foreground"
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
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
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
                            <div className="text-sm text-muted-foreground mb-1">Your Share</div>
                            <div className="text-3xl font-bold text-foreground mb-4">₹{Number(myParticipant.amount_due).toFixed(2)}</div>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${myParticipant.is_paid
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                    }`}
                            >
                                {myParticipant.is_paid ? '✅ Paid' : '⏳ Payment Pending'}
                            </span>
                            {!myParticipant.is_paid && Number(myParticipant.amount_due) > 0 && (
                                <p className="mt-4 text-xs text-muted-foreground">Please pay the organizer directly.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">You are not a participant in this event.</p>
                    )}
                </div>
            )}
        </div>
    );
}
