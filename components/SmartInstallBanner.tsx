'use client';

import { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function SmartInstallBanner() {
    const { showToast } = useToast();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check if user already dismissed it recently
        const hiddenUntil = localStorage.getItem('hide_install_banner');
        if (hiddenUntil && new Date().getTime() < parseInt(hiddenUntil)) {
            return;
        }

        // 2. Detect iOS (since it doesn't support beforeinstallprompt)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // 3. Listen for Android/Chrome install event
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Only show if not standalone
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setShowBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 4. Show for iOS if not standalone (simple check)
        if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        } else if (isIOS) {
            showToast("To install: tap the Share button below and select 'Add to Home Screen'.", 'info');
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        // Hide for 7 days
        const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('hide_install_banner', expiry.toString());
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-popover text-popover-foreground border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom duration-300 md:hidden">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    S
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Get the SquadUp App</h3>
                    <p className="text-xs text-muted-foreground">Better experience on mobile.</p>
                </div>
                <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                    Install
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            {isIOS && (
                <div className="mt-3 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                    Tap <Share className="w-3 h-3" /> then "Add to Home Screen"
                </div>
            )}
        </div>
    );
}
