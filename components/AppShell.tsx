'use client';

import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import Banner from './Banner';
import BackButton from './BackButton';
import { Menu } from 'lucide-react';
import { useState } from 'react';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import SmartInstallBanner from './SmartInstallBanner';
import { useEffect } from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Register Service Worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed', err));
        }
    }, []);

    // ... existing logic ...
    const pathname = usePathname();
    const { status } = useSession();
    const isAdmin = pathname?.startsWith('/admin');

    const isRegisterPage = pathname === '/register';
    const isLoginPage = pathname === '/' && status === 'unauthenticated';
    const shouldShowSidebar = !isRegisterPage && !isLoginPage;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SmartInstallBanner />
            {/* Banner Removed */}

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
                {shouldShowSidebar ? (
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                        <Menu size={24} />
                    </button>
                ) : (
                    <div className="w-10"></div> /* Spacer to keep title centered if desired, or just nothing */
                )}
                <span className="font-bold text-lg">After Hours</span>
                <ThemeToggle />
            </div>

            {/* Sidebar (Desktop) */}
            {shouldShowSidebar && (
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                    <Sidebar />
                </div>
            )}

            {/* Main Content */}
            <div className={`${shouldShowSidebar ? 'md:pl-64' : ''} flex flex-col min-h-screen`}>
                {/* Desktop Header Actions */}
                <div className="hidden md:flex justify-end p-4 items-center gap-4 absolute top-0 right-0 z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                        <ThemeToggle />
                    </div>
                </div>

                <main className={`flex-1 relative ${isAdmin ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
                    {!isAdmin && <BackButton />}
                    <div className={isAdmin ? '' : 'mt-12 md:mt-0'}>
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay (Simplified for now) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50">
                        <Sidebar />
                    </div>
                </div>
            )}
        </div>
    );
}
