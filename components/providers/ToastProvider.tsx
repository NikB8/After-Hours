'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationToast, { ToastType } from '@/components/NotificationToast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        // Hide first to reset animation if already showing
        setToast(prev => ({ ...prev, visible: false }));

        // Small delay to allow react to process the hide
        setTimeout(() => {
            setToast({ message, type, visible: true });
        }, 100);
    }, []);

    const closeToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <NotificationToast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={closeToast}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
