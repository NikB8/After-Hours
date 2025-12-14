'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function HomeActionButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [showModal, setShowModal] = useState(false);

    const handleGuestClick = () => {
        setShowModal(true);
    };

    if (isLoggedIn) {
        return (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                    href="/events"
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition shadow-lg"
                >
                    Browse Events
                </Link>
                <Link
                    href="/clubs"
                    className="px-8 py-4 bg-card text-primary border-2 border-primary rounded-full font-semibold text-lg hover:bg-primary/10 transition shadow-sm"
                >
                    Explore Clubs
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                    onClick={handleGuestClick}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition shadow-lg"
                >
                    Browse Events
                </button>
                <button
                    onClick={handleGuestClick}
                    className="px-8 py-4 bg-card text-primary border-2 border-primary rounded-full font-semibold text-lg hover:bg-primary/10 transition shadow-sm"
                >
                    Explore Clubs
                </button>
            </div>

            {/* Guest Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-card rounded-xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-200 border border-border">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4 text-primary">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Account Required</h3>
                            <p className="text-muted-foreground mb-6">
                                Please <span className="font-bold text-foreground">create an account</span> first. It's a quick, one-step process!
                            </p>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    // Focus on the sign-up form or scroll to it if needed
                                    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                                    if (emailInput) emailInput.focus();
                                }}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
