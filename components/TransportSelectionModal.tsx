'use client';

import { useState } from 'react';
import { Car, Users, X } from 'lucide-react';

interface TransportSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transportMode: string, carSeats?: number) => void;
    loading: boolean;
}

export default function TransportSelectionModal({ isOpen, onClose, onConfirm, loading }: TransportSelectionModalProps) {
    const [transportMode, setTransportMode] = useState<string>('');
    const [carSeats, setCarSeats] = useState<number>(0);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!transportMode) {
            setError('Please select a transport mode');
            return;
        }
        if (transportMode === 'Driver' && carSeats <= 0) {
            setError('Please specify valid seats available');
            return;
        }

        onConfirm(transportMode, carSeats);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-md">
            <div className="glass-panel w-full sm:w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 sm:duration-200 border-t sm:border border-border">
                {/* Mobile Drag Handle */}
                <div className="sm:hidden w-full flex justify-center pt-3 pb-1 bg-muted/50 border-b border-white/5">
                    <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
                    <h3 className="font-bold text-lg text-foreground">How are you getting there?</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => { setTransportMode('Independent'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Independent' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500' : 'border-border hover:border-green-500/50 hover:bg-muted/50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Independent' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-foreground">Reaching Myself</span>
                                <span className="text-xs text-muted-foreground">I have my own transport arranged.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setTransportMode('Rider'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Rider' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-border hover:border-blue-500/50 hover:bg-muted/50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Rider' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-foreground">Need a Ride</span>
                                <span className="text-xs text-muted-foreground">I&apos;m looking for a carpool.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setTransportMode('Driver'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Driver' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500' : 'border-border hover:border-purple-500/50 hover:bg-muted/50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Driver' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-foreground">I have a car</span>
                                <span className="text-xs text-muted-foreground">I can take other passengers!</span>
                            </div>
                        </button>
                    </div>

                    {transportMode === 'Driver' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-foreground mb-1">Seats Available (excluding you)</label>
                            <input
                                type="number"
                                min="1"
                                value={carSeats || ''}
                                onChange={(e) => setCarSeats(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-foreground"
                                placeholder="e.g. 3"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Confirming...' : 'Confirm RSVP'}
                    </button>
                </div>
            </div>
        </div>
    );
}
