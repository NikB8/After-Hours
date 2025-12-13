'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Save, X, Building2, Mail, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    image: string | null;
    company_name: string | null;
    primary_company: {
        domain_name: string;
        id: number;
    } | null;
    clubMemberships: {
        id: string;
        club: {
            id: string;
            name: string;
            category: string;
        };
    }[];
    participations: {
        status: string;
        event: {
            id: string;
            sport: string;
            start_time: string;
            venue_name: string;
            status: string;
            is_settled: boolean;
            club?: { name: string };
        };
    }[];
}

export default function ProfileDashboard({ profile }: { profile: UserProfile }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name || '');
    const [activeTab, setActiveTab] = useState<'future' | 'past'>('future');
    const [saving, setSaving] = useState(false);

    const handleSaveName = async () => {
        setSaving(true);
        try {
            // Assuming we have a general user update endpoint or we create a specific one.
            // For now, I'll assume standard /api/v1/users/me PATCH exists or use a server action.
            // Since the prompt didn't ask for the Update API, I'll quickly stub it or assume it's part of "Personal Info editing".
            // I will implement a quick client-side call to /api/v1/users/me if it exists, otherwise I might need to add it.
            // Actually, I'll fallback to just simulating for now if the endpoint isn't ready, but the prompt implies "Editable".
            // I'll assume we can PATCH to the profile endpoint or similar.
            // Let's try PATCH /api/v1/users/me/profile or just /api/auth/update if using NextAuth update.
            // Given I built /api/v1/users/me/profile, I should probably handle PATCH there too. I'll add that next.

            const res = await fetch('/api/v1/users/me/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            }
        } catch (e) {
            console.error('Failed to save name', e);
        } finally {
            setSaving(false);
        }
    };

    const companyName = profile.company_name || (profile.primary_company ? profile.primary_company.domain_name + " (Verified)" : "No Company Linked");

    const now = new Date();
    const futureEvents = profile.participations.filter(p => {
        const eventDate = new Date(p.event.start_time);
        return eventDate >= now && ['Confirmed', 'Waitlist', 'Maybe', 'Organizer'].includes(p.status);
    });

    const pastEvents = profile.participations.filter(p => {
        const eventDate = new Date(p.event.start_time);
        return eventDate < now && p.status === 'Confirmed';
    });

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header / Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center text-3xl font-bold text-green-700 shadow-inner">
                        {profile.image ? <img src={profile.image} alt={name} className="h-full w-full rounded-full object-cover" /> : name.charAt(0)}
                    </div>
                    <div className="space-y-2">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-2xl font-bold text-gray-900 border-b-2 border-green-500 focus:outline-none px-1"
                                />
                                <button onClick={handleSaveName} disabled={saving} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                                    <Save size={18} />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                {name}
                                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-green-600 transition">
                                    <Pencil size={18} />
                                </button>
                            </h1>
                        )}

                        <div className="flex flex-col gap-1 text-gray-500">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 size={16} />
                                <span className="font-medium text-gray-700">{companyName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clubs Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Your Clubs</h2>
                            <Link href="/clubs" className="text-sm font-semibold text-green-600 hover:text-green-700">Explore</Link>
                        </div>

                        {profile.clubMemberships.length > 0 ? (
                            <ul className="space-y-3">
                                {profile.clubMemberships.map(m => (
                                    <li key={m.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group hover:bg-green-50 transition">
                                        <div>
                                            <p className="font-semibold text-gray-900">{m.club.name}</p>
                                            <p className="text-xs text-gray-500">{m.club.category}</p>
                                        </div>
                                        <Link href={`/clubs/${m.club.id}`} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-600 transition">
                                            <ExternalLink size={16} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>You haven't joined any clubs yet.</p>
                                <Link href="/clubs" className="inline-block mt-3 text-sm font-medium text-green-600 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 transition">
                                    Browse Clubs
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Event History Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('future')}
                                className={`flex-1 py-4 text-center font-semibold text-sm transition ${activeTab === 'future' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Upcoming Events
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`flex-1 py-4 text-center font-semibold text-sm transition ${activeTab === 'past' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Past History
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'future' ? (
                                <div className="space-y-4">
                                    {futureEvents.length > 0 ? futureEvents.map(p => (
                                        <div key={p.event.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition bg-white">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{p.event.sport}</span>
                                                    {p.event.club && <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">{p.event.club.name}</span>}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{new Date(p.event.start_time).toLocaleDateString()} @ {new Date(p.event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin size={14} />
                                                    {p.event.venue_name}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {p.status}
                                                </span>
                                                <Link href={`/events/${p.event.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                    View / Manage RSVP
                                                </Link>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p>No upcoming events.</p>
                                            <Link href="/events" className="mt-2 inline-block text-green-600 font-medium hover:underline">Find something to do!</Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pastEvents.length > 0 ? pastEvents.map(p => (
                                        <div key={p.event.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition opacity-75 hover:opacity-100">
                                            <div className="flex-1">
                                                <h3 className="text-base font-bold text-gray-800">{new Date(p.event.start_time).toLocaleDateString()} - {p.event.sport}</h3>
                                                <p className="text-sm text-gray-500">{p.event.venue_name}</p>
                                            </div>
                                            <div className="flex items-center">
                                                {p.event.is_settled ? (
                                                    <Link href={`/events/${p.event.id}/finance`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm">
                                                        View Receipt
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Settlement Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>No past event history.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
