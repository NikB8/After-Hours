
// import { PrismaClient, MeetingScope, TicketStatus } from '@prisma/client';
import { notFound } from 'next/navigation';

// Mock Enum for Scope
const MeetingScope = {
    INTERNAL_CLUSTER: 'INTERNAL_CLUSTER',
    INTERNAL_PAN_INDIA: 'INTERNAL_PAN_INDIA',
    CLIENT_EXTERNAL: 'CLIENT_EXTERNAL'
};

// Helper to determine UI theme based on scope
const getTheme = (scope: String) => {
    if (scope === MeetingScope.INTERNAL_CLUSTER || scope === MeetingScope.INTERNAL_PAN_INDIA) {
        return {
            mode: 'INTERNAL',
            bgColor: 'bg-slate-50',
            borderColor: 'border-blue-600',
            badgeColor: 'bg-blue-100 text-blue-800',
            icon: '🏢'
        };
    }
    return {
        mode: 'EXTERNAL',
        bgColor: 'bg-white',
        borderColor: 'border-green-500',
        badgeColor: 'bg-green-100 text-green-800',
        icon: '🤝'
    };
};

export default async function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // MOCK DATA GENERATOR based on ID
    // If ID starts with 'm1' -> Internal
    // If ID starts with 'm2' -> External
    const isInternal = id.startsWith('m1');

    const mockMeeting = {
        id: id,
        title: isInternal ? "North Cluster Weekly Review" : "Q3 Business Review",
        date: new Date().toISOString(),
        scope: isInternal ? MeetingScope.INTERNAL_CLUSTER : MeetingScope.CLIENT_EXTERNAL,
        cluster: { name: "North Cluster" },
        client: { name: "Acme Corp" },
        minutes: { summary: "Discussed Q3 targets and churn risks. Action plan created." },
        actionItems: [
            {
                id: "a1",
                description: isInternal ? "Update Churn Forecast" : "Resolve Billing Dispute",
                priority: "HIGH",
                isInternal: isInternal,
                category: "FINANCE",
                ticket: isInternal ? null : { externalTicketId: "JIRA-1024" }
            },
            {
                id: "a2",
                description: "Schedule follow-up",
                priority: "MEDIUM",
                isInternal: true,
                category: "OPS",
                ticket: null
            }
        ]
    };

    const meeting = mockMeeting;

    if (!meeting) return notFound();

    const theme = getTheme(meeting.scope);

    return (
        <div className={`min-h-screen p-8 ${theme.bgColor}`}>
            <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-md border-l-8 ${theme.borderColor} overflow-hidden`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.badgeColor}`}>
                                {meeting.scope.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {new Date(meeting.date).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <span>{theme.icon}</span> {meeting.title}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {theme.mode === 'INTERNAL'
                                ? `Internal Review • Cluster: ${meeting.cluster?.name || 'N/A'}`
                                : `Client Visit • ${meeting.client?.name || 'Unknown Client'}`
                            }
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Minutes/Context */}
                    <div className="md:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                📝 Meeting Minutes
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                {meeting.minutes?.summary || (
                                    <span className="text-gray-400 italic">No minutes recorded yet.</span>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Action Items */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                ⚡ Action Items
                            </h2>

                            {/* Mock Action Input Form */}
                            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Add New Action</p>
                                <input
                                    type="text"
                                    placeholder="Describe action item..."
                                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 p-2"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span>Internal Task?</span>
                                        </label>
                                    </div>
                                    <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700">
                                        Add
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    ℹ️ Checking 'Internal' skips Jira ticket creation.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {meeting.actionItems.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No actions assigned.</p>
                                )}
                                {meeting.actionItems.map(item => (
                                    <div key={item.id} className="bg-white border p-3 rounded shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {item.priority}
                                            </span>
                                            {item.isInternal ? (
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200" title="Internal Notification">
                                                    🔔 Internal
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200" title="Jira Ticket">
                                                    🎫 {item.ticket?.externalTicketId || 'Pending Ticket'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mb-1">{item.description}</p>
                                        <div className="text-xs text-gray-500">
                                            Category: {item.category}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
