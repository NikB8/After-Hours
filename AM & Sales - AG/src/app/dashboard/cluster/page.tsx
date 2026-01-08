
import Link from 'next/link';
// import { PrismaClient, MeetingType, MeetingScope } from '@prisma/client';

// const prisma = new PrismaClient();

const MOCK_CLUSTER_DATA = {
    name: "North Cluster",
    region: "North India",
    totalClients: 42,
    totalAMs: 8,
    riskyClients: [
        { id: "rc1", name: "TechNova Systems", category: "CAT_A" },
        { id: "rc2", name: "BlueSky Logistics", category: "CAT_B" },
    ],
    upcomingReviews: [
        { id: "m1", title: "North Cluster Weekly Review", date: new Date().toISOString() },
        { id: "m2", title: "Q3 Strategy Sync", date: new Date(Date.now() + 86400000).toISOString() },
    ]
};

export default async function ClusterDashboardPage() {
    // Mock Data Bypass
    const cluster = MOCK_CLUSTER_DATA;
    const { totalClients, totalAMs, riskyClients, upcomingReviews } = cluster;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🏢 {cluster.name} Dashboard</h1>
                        <p className="text-gray-500">Region: {cluster.region} • National Review Ready</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Clients</p>
                        <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metric 1: AM Coverage */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Account Managers on Deck</h3>
                        <p className="text-4xl font-bold text-gray-800">{totalAMs}</p>
                    </div>

                    {/* Metric 2: Open Risks */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Clients At Risk</h3>
                        <p className={`text-4xl font-bold ${riskyClients.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {riskyClients.length}
                        </p>
                    </div>

                    {/* Metric 3: Upcoming Reviews */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-4">Next Internal Review</h3>
                        {upcomingReviews.length > 0 ? (
                            <div>
                                <p className="text-lg font-bold text-gray-800">{upcomingReviews[0].title}</p>
                                <p className="text-sm text-blue-600">{new Date(upcomingReviews[0].date).toLocaleDateString()}</p>
                                <Link
                                    href={`/meetings/${upcomingReviews[0].id}`}
                                    className="text-xs text-gray-400 hover:text-blue-600 underline mt-2 block"
                                >
                                    View Source
                                </Link>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No reviews scheduled.</p>
                        )}
                    </div>
                </div>

                {/* Risk Heatmap / Client List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">🔥 Risk Heatmap</h2>
                    </div>
                    <div className="p-6">
                        {riskyClients.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">All clear! No clients triggered risk alerts.</p>
                        ) : (
                            <div className="space-y-4">
                                {riskyClients.map(client => (
                                    <div key={client.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{client.name}</h4>
                                            <p className="text-sm text-red-600">Category: {client.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                                Active Rework Request
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
