'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, Key } from 'lucide-react';

export default function ProfileSecurity({ userEmail }: { userEmail: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState('');

    const handleReset = async () => {
        setRequesting(true);
        setMessage('');
        try {
            const res = await fetch('/api/v1/users/password/request_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || 'Reset link sent!');
            } else {
                setMessage(data.error || 'Failed to request reset.');
            }
        } catch (error) {
            setMessage('An error occurred.');
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Account Security
                </h3>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                value="password123placeholder" // Mocked value for security
                                readOnly
                                className="w-full p-2 pr-10 rounded-lg bg-muted/30 border border-border text-muted-foreground select-none"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <button
                            onClick={handleReset}
                            disabled={requesting}
                            className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted whitespace-nowrap flex items-center gap-2"
                        >
                            <Key className="w-4 h-4" />
                            {requesting ? 'Sending...' : 'Reset Password'}
                        </button>
                    </div>
                    {message && (
                        <p className={`mt-2 text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
