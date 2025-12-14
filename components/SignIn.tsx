'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function CredentialsLogin() {
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setErrorMessage(null);
        try {
            const { authenticate } = await import('@/app/actions');
            const result = await authenticate(undefined, formData);

            if (result === 'success') {
                window.location.href = '/';
            } else if (result) {
                setErrorMessage(result);
            }
        } catch (error) {
            console.error("Login call failed", error);
            setErrorMessage("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form action={handleSubmit} className="max-w-sm mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-border bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <div className="relative">
                <label className="block text-sm font-medium text-muted-foreground">
                    Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="block w-full rounded-md border border-border bg-background text-foreground px-3 py-2 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                disabled={isPending}
            >
                {isPending ? 'Signing In...' : 'Sign In'}
            </button>
            {errorMessage && <div className="text-red-500 dark:text-red-400 text-sm text-center">{errorMessage}</div>}
        </form>
    );
}
