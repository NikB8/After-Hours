
// import { getAMDashboardData } from '@/actions/dashboard';
// import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

// const prisma = new PrismaClient();

// Mock Data to bypass DB connection issues
const MOCK_DATA = {
    amName: "Nikhil Bhardwaj",
    portfolio: [
        { id: "c1", name: "Acme Corp", category: "CAT_A", lifecycleProgress: 75 },
        { id: "c2", name: "Globex Inc", category: "CAT_B", lifecycleProgress: 40 },
        { id: "c3", name: "Soylent Corp", category: "CAT_A", lifecycleProgress: 90 },
    ],
    todaysActions: {
        meetings: [
            { id: "m1", title: "Q3 Business Review", time: "10:00 AM", clientName: "Acme Corp" },
            { id: "m2", title: "Renewal Discussion", time: "02:00 PM", clientName: "Globex Inc" },
        ],
        checklists: [
            { id: "ch1", clientName: "Soylent Corp", status: "PENDING" }
        ]
    },
    settlementBlockers: [
        { id: "sb1", title: "Q2 Review", date: "2023-10-15", clientName: "Acme Corp", openTicketCount: 2 }
    ]
};

export default async function AMDashboardPage() {
    // const amId = await getMockSessionAM();
    // if (!amId) ...

    const data = MOCK_DATA;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {data.amName}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* WIDGET 1: My Portfolio */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">My Portfolio</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {data.portfolio.length} Clients
                        </span>
                    </div>

                    <div className="space-y-4">
                        {data.portfolio.length === 0 ? (
                            <p className="text-gray-400 text-sm">No clients assigned.</p>
                        ) : (
                            data.portfolio.map(client => (
                                <div key={client.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{client.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${client.category === 'CAT_A' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {client.category}
                                            </span>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${client.lifecycleProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Lifecycle: {Math.round(client.lifecycleProgress)}%</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* WIDGET 2: Today's Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Actions</h2>

                        <div className="space-y-4">
                            {/* Meetings */}
                            {data.todaysActions.meetings.map(meeting => (
                                <Link
                                    href={`/meetings/${meeting.id}`}
                                    key={meeting.id}
                                    className="block p-3 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-800">{meeting.title}</span>
                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{meeting.time}</span>
                                    </div>
                                    <p className="text-sm text-blue-600">{meeting.clientName}</p>
                                </Link>
                            ))}

                            {/* Checklists */}
                            {data.todaysActions.checklists.map(checklist => (
                                <div key={checklist.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Daily Walkthrough</h4>
                                            <p className="text-sm text-yellow-600">{checklist.clientName}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-medium transition-colors">
                                        Start
                                    </button>
                                </div>
                            ))}

                            {data.todaysActions.meetings.length === 0 && data.todaysActions.checklists.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">All caught up! 🎉</p>
                            )}
                        </div>
                    </div>

                    {/* WIDGET 3: Settlement Blockers */}
                    {data.settlementBlockers.length > 0 && (
                        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h2 className="text-xl font-semibold text-red-800">Settlement Blockers</h2>
                            </div>

                            <div className="space-y-3">
                                {data.settlementBlockers.map(blocker => (
                                    <div key={blocker.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{blocker.title} ({blocker.date})</h4>
                                                <p className="text-sm text-gray-500">{blocker.clientName}</p>
                                            </div>
                                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                                                {blocker.openTicketCount} Open Tickets
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
