'use client';

import { useEffect, useState } from 'react';
import ProfilePersonal from '@/components/ProfilePersonal';
import ProfileSecurity from '@/components/ProfileSecurity';
import ProfileHistory from '@/components/ProfileHistory';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/v1/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
                Failed to load profile.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                </div>

                <ProfilePersonal user={user} />
                <ProfileHistory events={user.past_events} />
                <ProfileSecurity userEmail={user.email} />
            </div>
        </div>
    );
}
