'use client';

import { useState, useEffect } from 'react';

type Participant = {
    id: string;
    user_id: string;
    user: { email: string; name: string | null };
    amount_due: number;
    is_paid: boolean;
    payment_status: string; // 'Unpaid' | 'In Review' | 'Paid'
};

type EventFinance = {
    estimated_cost: number | null;
    actual_cost: number | null;
    total_cost_final: number | null;
    per_person_share: number;
    financial_status: string;
    is_settled: boolean;
    organizer_id: string;
};

export default function FinancialHub({ eventId, userId }: { eventId: string; userId: string }) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [eventData, setEventData] = useState<EventFinance | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOrganizer, setIsOrganizer] = useState(false);

    useEffect(() => {
        fetchFinanceStatus();
    }, []);

    const fetchFinanceStatus = async () => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/finance/status`);
            const data = await res.json();
            if (data.event) {
                setEventData(data.event);
                setIsOrganizer(data.event.organizer_id === userId);
            }
            if (data.participants) {
                setParticipants(data.participants);
            }
        } catch (error) {
            console.error('Error fetching finance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'mark_self_paid' | 'confirm_payment' | 'reject_payment', participantId?: string) => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/finance/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, participant_id: participantId })
            });
            if (res.ok) {
                fetchFinanceStatus(); // Refresh UI
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    if (loading) return <div className="animate-pulse h-32 bg-muted/50 rounded-xl"></div>;

    const myParticipant = participants.find(p => p.user_id === userId);
    const totalCostDisplay = eventData?.total_cost_final || eventData?.actual_cost || eventData?.estimated_cost || 0;

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mt-6">
            {/* Section A: The Math */}
            <div className="bg-muted/50 p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">💰 Financial Hub</h3>
                        <p className="text-sm text-muted-foreground">
                            {eventData?.financial_status === 'Settled' ? '✅ Event Settled' : 'Waiting for payments'}
                        </p>
                    </div>
                    <div className="flex gap-6 text-right">
                        <div>
                            <div className="text-xs text-muted-foreground">Total Cost</div>
                            <div className="font-semibold text-foreground">₹{Number(totalCostDisplay).toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Your Share</div>
                            <div className="font-bold text-primary text-xl">
                                ₹{myParticipant ? Number(eventData?.per_person_share || 0).toFixed(2) : '0.00'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Action for Self */}
            {myParticipant && myParticipant.payment_status === 'Unpaid' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 flex justify-between items-center">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">Have you paid your share?</span>
                    <button
                        onClick={() => handleAction('mark_self_paid')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 shadow-sm"
                    >
                        I have Paid
                    </button>
                </div>
            )}
            {myParticipant && myParticipant.payment_status === 'In Review' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 text-center">
                    <span className="text-sm text-blue-800 dark:text-blue-200">⏳ Payment under review by Organizer</span>
                </div>
            )}

            {/* Section B: Member List */}
            <div className="p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Contribution Tracker</h4>
                <div className="space-y-3">
                    {participants.map((p) => (
                        <div key={p.id} className="flex flex-col sm:flex-row justify-between items-center bg-background border border-border rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                                    p.payment_status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {p.user.name?.[0] || p.user.email[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{p.user.name || p.user.email}</p>
                                    <div className="flex gap-2 items-center">
                                        <Badge status={p.payment_status} />
                                    </div>
                                </div>
                            </div>

                            {/* Section C: Organizer Actions */}
                            {isOrganizer && p.payment_status === 'In Review' && (
                                <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => handleAction('reject_payment', p.id)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('confirm_payment', p.id)}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 shadow-sm"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {participants.length === 0 && <div className="text-center text-muted-foreground py-4">No confirmed participants yet.</div>}
                </div>
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    if (status === 'Paid') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</span>;
    }
    if (status === 'In Review') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">In Review</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Unpaid</span>;
}
