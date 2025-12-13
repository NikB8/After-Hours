'use client';

import { useState, useEffect } from 'react';

type User = {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
};

type ResponseData = {
    counts: {
        Confirmed: number;
        Waitlist: number;
        Maybe: number;
        Declined: number;
        Organizer: number;
    };
    lists: {
        Confirmed: User[];
        Waitlist: User[];
        Maybe: User[];
        Declined: User[];
        Organizer: User[];
    };
};

export default function ResponseBreakdown({ eventId }: { eventId: string }) {
    const [data, setData] = useState<ResponseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/v1/events/${eventId}/responses`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to fetch responses', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    if (loading) return <div className="text-sm text-gray-500">Loading responses...</div>;
    if (!data) return <div className="text-sm text-red-500">Failed to load data.</div>;

    const sections = [
        { key: 'Confirmed', label: '✅ Confirmed', count: data.counts.Confirmed + data.counts.Organizer, color: 'text-green-700 bg-green-50' },
        { key: 'Maybe', label: '🤔 Maybe', count: data.counts.Maybe, color: 'text-yellow-700 bg-yellow-50' },
        { key: 'Declined', label: '❌ Declined', count: data.counts.Declined, color: 'text-red-700 bg-red-50' },
        { key: 'Waitlist', label: '⏳ Waitlist', count: data.counts.Waitlist, color: 'text-orange-700 bg-orange-50' },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {sections.map((s) => (
                    <div key={s.key} className={`p-2 rounded-lg ${s.color}`}>
                        <div className="text-xs uppercase font-bold opacity-75">{s.label}</div>
                        <div className="text-xl font-bold">{s.count}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 mt-4">
                {/* Combined list for Confirmed + Organizer */}
                <CollapsibleList
                    title="Confirmed"
                    users={[...data.lists.Organizer, ...data.lists.Confirmed]}
                />

                {data.lists.Maybe.length > 0 && (
                    <CollapsibleList title="Maybe" users={data.lists.Maybe} />
                )}

                {data.lists.Declined.length > 0 && (
                    <CollapsibleList title="Declined" users={data.lists.Declined} />
                )}

                {data.lists.Waitlist.length > 0 && (
                    <CollapsibleList title="Waitlist" users={data.lists.Waitlist} />
                )}
            </div>
        </div>
    );
}

function CollapsibleList({ title, users }: { title: string, users: User[] }) {
    const [open, setOpen] = useState(false);

    if (users.length === 0) return null;

    return (
        <div className="border rounded-md overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-3 bg-gray-50 text-sm font-medium hover:bg-gray-100"
            >
                <span>{title} ({users.length})</span>
                <span>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <ul className="divide-y divide-gray-100 bg-white p-2">
                    {users.map((u, idx) => (
                        <li key={idx} className="py-2 px-2 text-sm text-gray-700 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold overflow-hidden">
                                {u.image ? <img src={u.image} alt={u.name || ''} /> : (u.name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                            <span>{u.name || u.email}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
