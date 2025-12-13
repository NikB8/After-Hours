'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Users,
    Calendar,
    BarChart3,
    ShieldCheck,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { GrowthChart, FinancialChart } from '@/components/AdminCharts';

interface KPIs {
    total_users: number;
    total_games: number;
    active_organizers_30d: number;
    api_error_rate_24h: number;
}

interface Financials {
    total_settled: number;
    total_debt: number;
    platform_fees: number;
}

export default function AdminDashboard() {
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlldata = async () => {
            try {
                const [resKpis, resFin, resGrowth] = await Promise.all([
                    fetch('/api/v1/admin/kpis'),
                    fetch('/api/v1/admin/financial_summary'),
                    fetch('/api/v1/admin/growth')
                ]);

                if (resKpis.ok) setKpis(await resKpis.json());
                if (resFin.ok) setFinancials(await resFin.json());
                if (resGrowth.ok) setGrowthData(await resGrowth.json());
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlldata();
    }, []);

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">System Health & Monitoring</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={loading ? '...' : kpis?.total_users}
                    icon={<Users className="w-8 h-8 text-blue-500" />}
                />
                <StatCard
                    title="Games Organized"
                    value={loading ? '...' : kpis?.total_games}
                    icon={<Calendar className="w-8 h-8 text-purple-500" />}
                />
                <StatCard
                    title="Active Organizers (30d)"
                    value={loading ? '...' : kpis?.active_organizers_30d}
                    icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
                />
                <StatCard
                    title="API Error Rate (24h)"
                    value={loading ? '...' : `${kpis?.api_error_rate_24h}%`}
                    icon={<AlertTriangle className="w-8 h-8 text-green-500" />}
                    subtext="Target: < 1%"
                    color={kpis && kpis.api_error_rate_24h < 1 ? 'text-green-600' : 'text-red-600'}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GrowthChart data={growthData} />
                <FinancialChart
                    settled={financials?.total_settled || 0}
                    debt={financials?.total_debt || 0}
                />
            </div>

            {/* Financial Summary Text */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <p className="text-sm text-gray-500 uppercase">Total Value Settled</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {loading ? '...' : `₹${financials?.total_settled.toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <p className="text-sm text-gray-500 uppercase">Remaining Debt</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {loading ? '...' : `₹${financials?.total_debt.toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <p className="text-sm text-gray-500 uppercase">Platform Fees (Est.)</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {loading ? '...' : `₹${financials?.platform_fees?.toLocaleString()}`}
                    </p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Link href="/admin/users" className="block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5" /> User Manager
                    </h2>
                    <p className="text-gray-600">View all users, search by email, and promote/demote admins.</p>
                </Link>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtext, color = 'text-gray-900' }: { title: string, value: any, icon: any, subtext?: string, color?: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}
