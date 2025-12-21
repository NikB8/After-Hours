'use client';

import { useEffect, useState } from 'react';
import { Check, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export default function NotificationToast({ message, type = 'success', isVisible, onClose }: ToastProps) {
    const [showing, setShowing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowing(true);
            const timer = setTimeout(() => {
                setShowing(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible && !showing) return null;

    const bgMap = {
        success: 'bg-emerald-500/90 text-white',
        error: 'bg-red-500/90 text-white',
        info: 'bg-blue-500/90 text-white'
    };

    const Icon = {
        success: Check,
        error: X,
        info: Info
    }[type];

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${showing ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg backdrop-blur-md ${bgMap[type]}`}>
                <Icon size={18} strokeWidth={3} />
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
}
