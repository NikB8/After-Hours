'use client';

import { useState, useEffect } from 'react';

type Participant = {
    id: string;
    user: { email: string };
    team_name: string | null;
};

export default function TeamBuilder({ eventId, userEmail, isOrganizer }: { eventId: string; userEmail: string; isOrganizer: boolean }) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teams, setTeams] = useState<string[]>(['Team A', 'Team B']); // Default teams

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            // Re-using the logistics endpoint as it returns participants
            const res = await fetch(`/api/v1/events/${eventId}/logistics`);
            const data = await res.json();
            const all = [...data.drivers, ...data.riders, ...data.independent];
            // Deduplicate by ID just in case
            const unique = Array.from(new Map(all.map((p: any) => [p.id, p])).values()) as Participant[];
            setParticipants(unique);
        } catch (error) {
            console.error('Error fetching participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const moveParticipant = (participantId: string, teamName: string | null) => {
        setParticipants((prev) =>
            prev.map((p) => (p.id === participantId ? { ...p, team_name: teamName } : p))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const assignments = participants.map((p) => ({
                participant_id: p.id,
                team_name: p.team_name,
            }));

            const res = await fetch(`/api/v1/events/${eventId}/teams`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: userEmail,
                    assignments,
                }),
            });

            if (res.ok) {
                alert('Teams saved successfully!');
            } else {
                alert('Failed to save teams');
            }
        } catch (error) {
            console.error('Error saving teams:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

    // Group by team
    const unassigned = participants.filter((p) => !p.team_name);
    const teamA = participants.filter((p) => p.team_name === 'Team A');
    const teamB = participants.filter((p) => p.team_name === 'Team B');

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">⚔️ Team Builder</h3>
                {isOrganizer && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Teams'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Unassigned */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Unassigned ({unassigned.length})</h4>
                    <ul className="space-y-2">
                        {unassigned.map((p) => (
                            <li key={p.id} className="bg-white p-2 rounded shadow-sm text-sm flex justify-between items-center">
                                <span className="truncate max-w-[100px]">{p.user.email}</span>
                                {isOrganizer && (
                                    <div className="flex gap-1">
                                        <button onClick={() => moveParticipant(p.id, 'Team A')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">A</button>
                                        <button onClick={() => moveParticipant(p.id, 'Team B')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">B</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Team A */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="font-medium text-red-800 mb-2">Team A ({teamA.length})</h4>
                    <ul className="space-y-2">
                        {teamA.map((p) => (
                            <li key={p.id} className="bg-white p-2 rounded shadow-sm text-sm flex justify-between items-center border-l-4 border-red-400">
                                <span className="truncate max-w-[120px]">{p.user.email}</span>
                                {isOrganizer && (
                                    <button onClick={() => moveParticipant(p.id, null)} className="text-gray-400 hover:text-gray-600">✕</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Team B */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Team B ({teamB.length})</h4>
                    <ul className="space-y-2">
                        {teamB.map((p) => (
                            <li key={p.id} className="bg-white p-2 rounded shadow-sm text-sm flex justify-between items-center border-l-4 border-blue-400">
                                <span className="truncate max-w-[120px]">{p.user.email}</span>
                                {isOrganizer && (
                                    <button onClick={() => moveParticipant(p.id, null)} className="text-gray-400 hover:text-gray-600">✕</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
