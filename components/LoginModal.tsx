'use client';

import { X } from 'lucide-react';
import { CredentialsLogin } from '@/components/SignIn';

type LoginModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <div
                className="glass-panel w-full sm:w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-in slide-in-from-bottom-full sm:scale-100 duration-300 sm:duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Drag Handle */}
                <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="p-6 pt-2 sm:pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <CredentialsLogin />
                    </div>
                </div>
            </div>
        </div>
    );
}
