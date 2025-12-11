'use client';

import { useState, useEffect } from 'react';

// Mock current user email for API calls
const CURRENT_USER_EMAIL = 'nikhil@example.com';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/v1/admin/stats?user_email=${CURRENT_USER_EMAIL}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse">Loading stats...</div>;
    if (!stats) return <div>Error loading stats</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Users</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{stats.users}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Events</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{stats.events}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Active Clubs</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{stats.clubs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Corporate Partners</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{stats.partners}</div>
                </div>
            </div>
        </div>
    );
}
