'use client';

import Link from 'next/link';
import { X, Lock } from 'lucide-react';

interface AuthPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    callbackUrl: string;
}

export default function AuthPromptModal({ isOpen, onClose, callbackUrl }: AuthPromptModalProps) {
    if (!isOpen) return null;

    const encodedCallback = encodeURIComponent(callbackUrl);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-md">
            <div className="glass-panel w-full sm:w-auto max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 sm:duration-200">
                {/* Mobile Drag Handle */}
                <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="relative p-6 text-center pt-2 sm:pt-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Action!</h3>
                    <p className="text-gray-600 mb-6">
                        Please Log In or Sign Up to secure your spot. <br />
                        <span className="font-semibold text-blue-600">It's a quick, one-step process!</span>
                    </p>

                    <div className="space-y-3">
                        <Link
                            href={`/login?callbackUrl=${encodedCallback}`}
                            className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            Log In
                        </Link>
                        <Link
                            href={`/register?callbackUrl=${encodedCallback}`}
                            className="block w-full py-3 px-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
