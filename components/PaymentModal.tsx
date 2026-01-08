'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Check, Copy, ExternalLink } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    organizer: {
        name: string | null;
        email: string;
        upi_id: string | null;
        image: string | null;
    };
    amount: number;
    eventTitle?: string;
}

export default function PaymentModal({ isOpen, onClose, onConfirm, organizer, amount, eventTitle }: PaymentModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    if (!organizer.upi_id) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-border">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <X size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Setup Required</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            The organizer hasn't set up their UPI ID yet. Please confirm payment with them directly.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="btn-secondary flex-1">Close</button>
                            <button onClick={onConfirm} className="btn-primary flex-1">Mark as Paid</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Generate UPI Intent Link
    // format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
    const params = new URLSearchParams({
        pa: organizer.upi_id,
        pn: organizer.name || organizer.email,
        am: amount.toFixed(2),
        cu: 'INR',
        tn: `SquadUp: ${eventTitle || 'Event Share'}`
    });
    const upiLink = `upi://pay?${params.toString()}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(organizer.upi_id!);
        setCopied(true);
        triggerHaptic();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-foreground">Pay your share</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Organizer Context */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-border">
                            {organizer.image ? (
                                <img src={organizer.image} alt={organizer.name || 'Organizer'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                                    {(organizer.name?.[0] || organizer.email[0]).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Paying to</p>
                            <p className="font-bold text-foreground text-lg leading-tight">{organizer.name || organizer.email}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                    {organizer.upi_id}
                                </code>
                                <button onClick={handleCopy} className="text-primary hover:text-primary/80">
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Amount & QR */}
                    <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                        <div className="text-center">
                            <span className="text-3xl font-black text-foreground">₹{amount.toFixed(2)}</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <QRCodeSVG
                                value={upiLink}
                                size={200}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                            Scan with any UPI app (GPay, PhonePe, Paytm)
                        </p>
                    </div>

                    {/* Mobile Button */}
                    <a
                        href={upiLink}
                        className="btn-secondary w-full flex items-center justify-center gap-2 mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    >
                        <ExternalLink size={18} />
                        Tap to Pay on Mobile
                    </a>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border bg-muted/30">
                    <p className="text-xs text-center text-muted-foreground mb-3">
                        After paying, please confirm below so the organizer knows.
                    </p>
                    <button
                        onClick={() => {
                            triggerHaptic();
                            onConfirm();
                        }}
                        className="btn-primary w-full py-3 text-base shadow-md"
                    >
                        ✅ I have made the payment
                    </button>
                </div>
            </div>
        </div>
    );
}
