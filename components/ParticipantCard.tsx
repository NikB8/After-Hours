'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    QrCode,
    XCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import LoginModal from '@/components/LoginModal';
import { useToast } from '@/components/providers/ToastProvider';

interface PublicEventData {
    id: string;
    sport: string;
    date: string;
    venue: string;
    map_link: string;
    status: string;
    max_players: number;
    current_players: number;
    participants: { id: string; name: string }[];
    organizer: string;
}

export default function ParticipantCard({ eventId, referrerId }: { eventId: string, referrerId?: string }) {
    const { showToast } = useToast();
    const [event, setEvent] = useState<PublicEventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [userStatus, setUserStatus] = useState<'None' | 'Confirmed' | 'Waitlist' | 'Declined'>('None');
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Finance State
    const [finances, setFinances] = useState<{ amount_due: number, is_paid: boolean, payment_status: string } | null>(null);
    const [upiDetails, setUpiDetails] = useState<{ upi_id: string, payee_name: string } | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);

    const { data: session } = useSession();
    const viewerEmail = session?.user?.email;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/v1/events/${eventId}/public`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);

                    const userId = (session?.user as any)?.id;
                    // Note: session.user.id checking against participant.id
                    const participant = data.participants.find((p: any) => p.id === userId);

                    if (participant) {
                        setUserStatus('Confirmed');

                        // Fetch financial status
                        fetch(`/api/v1/events/${eventId}/participant/me`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_email: viewerEmail })
                        }).then(r => r.json()).then(setFinances).catch(console.error);

                        // Fetch UPI if event completed
                        if (data.status === 'Completed') {
                            fetch(`/api/v1/events/${eventId}/organizer_upi`).then(r => r.json()).then(setUpiDetails).catch(console.error);
                        }

                    } else {
                        setUserStatus('None');
                    }
                }
            } catch (error) {
                console.error('Failed to load event', error);
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId, viewerEmail, session]);

    const handleNotifyPayment = async () => {
        if (!confirm("Are you sure you have made the payment?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/participant/notify_payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: viewerEmail })
            });
            if (res.ok) {
                window.location.reload();
            } else {
                showToast('Failed to update status', 'error');
            }
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleRSVP = async () => {
        if (!viewerEmail) {
            setShowLoginModal(true);
            return;
        }
        setActionLoading(true);
        try {
            const res = await fetch(`/api/v1/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: viewerEmail, // Fallback if API needs it
                    status: 'Confirmed',
                    referred_by_id: referrerId
                })
            });
            if (res.ok) {
                window.location.reload();
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to join', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Something went wrong', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Derived State
    const isFull = event ? (event.current_players >= event.max_players) : false;
    const isCompleted = event ? (event.status === 'Completed' || event.status === 'Cancelled') : false;

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    if (!event) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Event not found</div>;

    const eventDate = new Date(event.date);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <QrCode className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider mb-4 border border-white/10 uppercase">
                            {event.sport}
                        </span>
                        <h1 className="text-3xl font-black leading-tight mb-2">
                            {event.venue}
                        </h1>
                        <div className="flex items-center space-x-2 text-blue-100 text-sm font-medium">
                            <MapPin className="w-4 h-4" />
                            <a href={event.map_link} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors truncate max-w-[200px]">
                                View on Map
                            </a>
                        </div>
                    </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Date</p>
                                <p className="font-bold text-gray-900">{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Time</p>
                                <p className="font-bold text-gray-900">{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                Players
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {event.current_players} / {event.max_players}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            {event.participants.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center">Be the first to join!</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {event.participants.map((p) => (
                                        <div key={p.id} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium truncate">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        {isCompleted && userStatus === 'Confirmed' ? (
                            <button
                                className="w-full py-4 px-6 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-lg hover:bg-purple-700 transition-transform active:scale-95 flex items-center justify-center transform hover:-translate-y-1"
                                onClick={() => setShowPayModal(true)}
                            >
                                <span>Pay Share</span>
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleRSVP}
                                disabled={actionLoading || userStatus === 'Confirmed'}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-transform active:scale-95
                                            ${!viewerEmail
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : userStatus === 'Confirmed'
                                            ? 'bg-green-100 text-green-700 cursor-default shadow-none'
                                            : isFull
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {actionLoading ? 'Processing...' : (
                                    !viewerEmail ? (
                                        <>LOG IN TO JOIN <ChevronRight className="w-5 h-5 ml-2" /></>
                                    ) : userStatus === 'Confirmed' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" /> You're Going!
                                        </>
                                    ) : (
                                        isFull ? 'Join Waitlist' : 'RSVP Now'
                                    )
                                )}
                            </button>
                        )}

                        {userStatus === 'Confirmed' && !isCompleted && (
                            <p className="text-xs text-green-600 font-medium text-center">
                                You are confirmed for this game.
                            </p>
                        )}
                        {isFull && userStatus !== 'Confirmed' && (
                            <p className="text-xs text-yellow-600 flex items-center justify-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                You will be added to the waitlist.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && finances && upiDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="bg-purple-600 p-6 text-center text-white relative">
                            <h3 className="text-xl font-bold">Your Share</h3>
                            <p className="text-4xl font-black mt-2">${Number(finances.amount_due).toFixed(2)}</p>
                            <button onClick={() => setShowPayModal(false)} className="absolute top-4 right-4 p-1 bg-white/20 rounded-full hover:bg-white/30"><XCircle className="w-5 h-5 text-white" /></button>
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            {finances.is_paid ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900">Payment Complete!</h4>
                                    <p className="text-gray-500 mt-2">Thank you for settling up.</p>
                                </div>
                            ) : finances.payment_status === 'Pending_Confirmation' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Verification Pending</h4>
                                    <p className="text-sm text-gray-500 mt-2 px-4">You have marked this as paid. The organizer will confirm shortly.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-6">
                                        <QRCodeSVG
                                            value={`upi://pay?pa=${upiDetails.upi_id}&pn=${upiDetails.payee_name}&am=${finances.amount_due}&cu=INR`}
                                            size={180}
                                            level={"H"}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="text-center mb-6">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Pay To</p>
                                        <p className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded text-sm select-all">{upiDetails.upi_id}</p>
                                    </div>

                                    <button
                                        onClick={handleNotifyPayment}
                                        disabled={actionLoading}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all"
                                    >
                                        {actionLoading ? 'Updating...' : 'I Have Paid'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
