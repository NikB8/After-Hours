'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type FinanceData = {
    total_cost: number;
    total_collected: number;
    total_outcome_outstanding: number;
    my_amount_due: number;
    my_is_paid: boolean;
    participants: {
        user_id: string;
        user_name: string;
        is_paid: boolean;
    }[];
};

export default function PaymentDueCard({ eventId, userEmail }: { eventId: string, userEmail: string }) {
    const [data, setData] = useState<FinanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/member_finance?user_email=${userEmail}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Error fetching finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [eventId, userEmail]);

    if (loading) return <div className="p-4 bg-gray-50 rounded-lg animate-pulse h-32"></div>;
    if (!data) return null;

    const unpaidMembers = data.participants.filter(p => !p.is_paid);

    return (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border mt-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <DollarSign className="w-32 h-32 text-green-700" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Event Expenses
            </h3>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/50 p-3 rounded-lg border border-border text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Cost</p>
                    <p className="text-lg font-black text-foreground">₹{data.total_cost.toFixed(2)}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wider font-bold">Collected</p>
                    <p className="text-lg font-black text-green-700 dark:text-green-300">₹{data.total_collected.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800 text-center">
                    <p className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wider font-bold">Still Owed</p>
                    <p className="text-lg font-black text-red-700 dark:text-red-300">₹{data.total_outcome_outstanding.toFixed(2)}</p>
                </div>
            </div>

            {/* My Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6 border border-border">
                <div>
                    <p className="text-sm font-bold text-muted-foreground">Your Share</p>
                    <p className="text-2xl font-black text-foreground">₹{Number(data.my_amount_due).toFixed(2)}</p>
                </div>
                <div>
                    {data.my_is_paid ? (
                        <div className="flex items-center text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" /> Paid
                        </div>
                    ) : (
                        <div className="flex items-center text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" /> Pending
                        </div>
                    )}
                </div>
            </div>

            {/* Outstanding Debt List (Collapsible) */}
            <div className="border-t pt-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="text-sm font-bold text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Members Who Still Owe Money ({unpaidMembers.length})
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {expanded && (
                    <div className="mt-4 space-y-2 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg animate-in slide-in-from-top-2">
                        {unpaidMembers.length === 0 ? (
                            <p className="text-sm text-green-600 font-medium text-center">Everyone has paid! 🎉</p>
                        ) : (
                            unpaidMembers.map(p => (
                                <div key={p.user_id} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{p.user_name}</span>
                                    <span className="text-xs text-red-500 font-bold px-2 py-1 bg-card rounded-full border border-red-200 dark:border-red-800">Unpaid</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
