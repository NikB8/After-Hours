
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Car,
    DollarSign,
    RefreshCcw,
    Calendar,
    MapPin,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

interface Participant {
    id: string;
    user: {
        id: string;
        email: string;
    };
    status: string;
    is_paid: boolean;
    amount_due: number;
    transport_mode: string;
    pickup_location?: string;
    assigned_driver_id?: string;
    team_name?: string;
}

interface EventData {
    id: string;
    sport: string;
    venue_name: string;
    start_time: string;
    status: string;
    total_cost_final: string | null;
    is_settled: boolean;
    participants: Participant[];
}

interface FinanceSummary {
    estimated_cost: string;
    actual_cost: string | null;
    total_collected: number;
    pending_amount: number;
}

interface LogisticsSummary {
    total_participants: number;
    confirmed: number;
    waitlist: number;
    needs_ride: number;
    drivers_available: number;
}

interface DashboardData {
    event: EventData;
    financeSummary: FinanceSummary;
    logisticsSummary: LogisticsSummary;
    currentUser: { id: string; email: string };
}

export default function CreatorDashboard({ eventId }: { eventId: string }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rsvp' | 'logistics' | 'finance'>('rsvp');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [settleAmount, setSettleAmount] = useState('');
    const [submittingSettle, setSubmittingSettle] = useState(false);
    const [showModal, setShowModal] = useState<'paid' | 'unpaid' | null>(null);
    const [modalData, setModalData] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/manage`);
            if (res.status === 403) {
                setError('Access Denied. You are not the organizer.');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch data');
            const jsonData = await res.json();
            setData(jsonData);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and Polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [eventId]);

    const handleSettle = async () => {
        if (!settleAmount || isNaN(Number(settleAmount))) return alert('Please enter a valid amount');
        setSubmittingSettle(true);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/settle_final`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: data?.currentUser.email,
                    total_cost_final: Number(settleAmount)
                })
            });
            if (res.ok) {
                fetchData();
                setSettleAmount('');
            } else {
                alert('Failed to settle event');
            }
        } catch (e) { console.error(e); }
        finally { setSubmittingSettle(false); }
    };

    const togglePaymentStatus = async (participantId: string, currentStatus: boolean) => {
        if (!data) return;

        try {
            const res = await fetch(`/api/v1/events/${eventId}/finance/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: data.currentUser.email,
                    participant_id: participantId,
                    is_paid: !currentStatus
                })
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('Payment update failed:', err);
                alert('Failed to update payment status: ' + (err.error || 'Unknown error'));
                return;
            }

            // Re-fetch immediately to show update
            fetchData();
            // Also refresh modal if open
            if (showModal) openModal(showModal);
        } catch (e) {
            console.error(e);
            alert('Error updating payment status');
        }
    };

    const openModal = async (type: 'paid' | 'unpaid') => {
        setShowModal(type);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/payments_status`);
            if (res.ok) {
                const json = await res.json();
                setModalData(type === 'paid' ? json.paid : json.unpaid);
            }
        } catch (e) { console.error(e); }
    };

    if (loading && !data) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
    if (!data) return null;

    const isSettled = data.event.is_settled;
    const totalCost = data.event.total_cost_final
        ? Number(data.event.total_cost_final)
        : Number(data.financeSummary.estimated_cost);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{data.event.sport} Dashboard</h1>
                        <div className="flex items-center space-x-4 mt-2 text-gray-600">
                            <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(data.event.start_time).toLocaleDateString()}</div>
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {data.event.venue_name}</div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.event.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{data.event.status}</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1 animate-pulse" />
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('rsvp')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rsvp' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <Users className="w-4 h-4 mr-2" /> People
                </button>
                <button
                    onClick={() => setActiveTab('logistics')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logistics' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <Car className="w-4 h-4 mr-2" /> Logistics
                </button>
                <button
                    onClick={() => setActiveTab('finance')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'finance' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <DollarSign className="w-4 h-4 mr-2" /> Finance
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-md min-h-[400px]">
                {/* RSVP Tab */}
                {activeTab === 'rsvp' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-gray-900">{data.logisticsSummary.total_participants}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-green-700">{data.logisticsSummary.confirmed}</span>
                                <span className="text-xs text-green-600 uppercase tracking-wide">Confirmed</span>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-yellow-700">{data.logisticsSummary.waitlist}</span>
                                <span className="text-xs text-yellow-600 uppercase tracking-wide">Waitlist</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.event.participants.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${p.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                        p.status === 'Waitlist' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.team_name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Logistics Tab */}
                {activeTab === 'logistics' && (
                    <div className="p-6">
                        <div className="flex space-x-8 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Transport Needs</h3>
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">{data.logisticsSummary.needs_ride}</span> people need a ride.
                                </p>
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">{data.logisticsSummary.drivers_available}</span> drivers available.
                                </p>
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Carpool List</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">User</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Mode</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Pickup</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Driver</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.event.participants.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 text-gray-900">{p.user.email}</td>
                                            <td className="px-4 py-3">{p.transport_mode}</td>
                                            <td className="px-4 py-3 text-gray-500">{p.pickup_location || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-blue-600">{
                                                p.assigned_driver_id ? 'Assigned' : (p.transport_mode === 'Rider' ? 'Unassigned' : '-')
                                            }</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Finance Tab */}
                {activeTab === 'finance' && (
                    <div className="p-6 md:p-8 bg-gray-50/50 min-h-full">
                        {/* 1. Settlement Section */}
                        {(!data.event.total_cost_final) && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Finalize Event Cost</h3>
                                    <p className="text-sm text-gray-500">Enter the final total amount to split among confirmed players.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={settleAmount}
                                            onChange={(e) => setSettleAmount(e.target.value)}
                                            className="pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-32 font-medium"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSettle}
                                        disabled={submittingSettle}
                                        className="bg-purple-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50"
                                    >
                                        {submittingSettle ? 'Settling...' : 'Settle Cost'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2. Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Total Cost Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1">Total Cost</p>
                                    <p className="text-3xl font-black text-gray-900">${totalCost.toFixed(2)}</p>
                                    {isSettled || (data.event.total_cost_final && data.financeSummary.total_collected >= Number(data.event.total_cost_final)) ? (
                                        <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            <CheckCircle className="w-3 h-3 mr-1" /> SETTLED
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-bold ${data.event.total_cost_final ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {data.event.total_cost_final ? 'COLLECTING' : 'ESTIMATED'}
                                        </span>
                                    )}
                                </div>
                                <DollarSign className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-gray-50 opacity-10" />
                            </div>

                            {/* Collected Card - Clickable - Added ID for testing */}
                            <div
                                id="card-collected"
                                onClick={() => openModal('paid')}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-green-200 hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1 group-hover:text-green-600 transition-colors">Collected</p>
                                    <p className="text-3xl font-black text-green-600">${data.financeSummary.total_collected.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium group-hover:text-green-500">View Paid List &rarr;</p>
                                </div>
                                <CheckCircle className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-green-50 opacity-20 group-hover:opacity-30 transition-opacity" />
                            </div>

                            {/* Remaining Card - Clickable - Added ID for testing */}
                            <div
                                id="card-unpaid"
                                onClick={() => openModal('unpaid')}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-red-200 hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1 group-hover:text-red-600 transition-colors">Remaining</p>
                                    <p className="text-3xl font-black text-red-500">${data.financeSummary.pending_amount.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium group-hover:text-red-500">View Pending List &rarr;</p>
                                </div>
                                <XCircle className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-red-50 opacity-20 group-hover:opacity-30 transition-opacity" />
                            </div>
                        </div>

                        {/* 3. Main List (Full View) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">All Transactions</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-bold text-gray-500">User</th>
                                        <th className="px-6 py-3 text-left font-bold text-gray-500">Amount</th>
                                        <th className="px-6 py-3 text-left font-bold text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-right font-bold text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {data.event.participants.filter(p => p.status === 'Confirmed').map((p) => (
                                        <tr key={p.id} className={p.is_paid ? 'bg-green-50/20' : ''}>
                                            <td className="px-6 py-4 font-medium text-gray-900">{p.user.email}</td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">${Number(p.amount_due).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                {p.is_paid ? (
                                                    <span className="inline-flex items-center text-green-700 font-bold text-xs bg-green-100 px-2 py-0.5 rounded-full">
                                                        PAID
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full">
                                                        PENDING
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => togglePaymentStatus(p.id, p.is_paid)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all transform active:scale-95 ${p.is_paid
                                                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                                                        }`}
                                                >
                                                    {p.is_paid ? 'Undo' : 'Mark Paid'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Drill Down Modal */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(null)}>
                                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className={`text-xl font-black ${showModal === 'paid' ? 'text-green-700' : 'text-red-600'}`}>
                                            {showModal === 'paid' ? 'Collected Payments' : 'Pending Payments'}
                                        </h3>
                                        <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-200 rounded-full"><XCircle className="w-6 h-6 text-gray-400" /></button>
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                                        {modalData.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 italic">No participants in this list.</div>
                                        ) : (
                                            modalData.map((item: any) => (
                                                <div key={item.participant_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.user_email}</p>
                                                        <p className="text-xs text-gray-500 font-mono">Due: ${Number(item.amount_due).toFixed(2)}</p>
                                                    </div>
                                                    {showModal === 'unpaid' && (
                                                        <button
                                                            onClick={() => togglePaymentStatus(item.participant_id, false)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-700 transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    {showModal === 'paid' && (
                                                        <span className="text-green-600 font-bold text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Paid</span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 text-center">
                                        <button onClick={() => setShowModal(null)} className="text-gray-500 text-sm font-bold hover:text-gray-800">Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

