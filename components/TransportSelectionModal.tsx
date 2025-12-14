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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-900">How are you getting there?</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => { setTransportMode('Independent'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Independent' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Independent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900">Reaching Myself</span>
                                <span className="text-xs text-gray-500">I have my own transport arranged.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setTransportMode('Rider'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Rider' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Rider' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900">Need a Ride</span>
                                <span className="text-xs text-gray-500">I'm looking for a carpool.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setTransportMode('Driver'); setError(''); }}
                            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${transportMode === 'Driver' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-2 rounded-full ${transportMode === 'Driver' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900">I have a car</span>
                                <span className="text-xs text-gray-500">I can take other passengers!</span>
                            </div>
                        </button>
                    </div>

                    {transportMode === 'Driver' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seats Available (excluding you)</label>
                            <input
                                type="number"
                                min="1"
                                value={carSeats || ''}
                                onChange={(e) => setCarSeats(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g. 3"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Confirming...' : 'Confirm RSVP'}
                    </button>
                </div>
            </div>
        </div>
    );
}
