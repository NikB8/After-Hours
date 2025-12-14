'use client';

import { useState, useEffect } from 'react';

type Participant = {
    id: string;
    user: { email: string; name: string | null; };
    team_name: string | null;
};

export default function TeamBuilder({ eventId, userEmail, userId, isOrganizer }: { eventId: string; userEmail: string; userId: string; isOrganizer: boolean }) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teams, setTeams] = useState<string[]>(['Team A', 'Team B']);
    const [newTeamName, setNewTeamName] = useState('');

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const res = await fetch(`/api/v1/events/${eventId}/teams`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setParticipants(data);
                // Discover any existing teams not in default list
                const existingTeams = new Set(data.map(p => p.team_name).filter(Boolean) as string[]);
                setTeams(prev => Array.from(new Set([...prev, ...existingTeams])));
            } else {
                console.error('Failed to load participants:', data);
                setParticipants([]);
            }
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

    const addTeam = () => {
        if (!newTeamName.trim()) return;
        if (teams.includes(newTeamName.trim())) return;
        setTeams([...teams, newTeamName.trim()]);
        setNewTeamName('');
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

    const unassigned = participants.filter((p) => !p.team_name);

    return (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold text-foreground">⚔️ Team Builder</h3>
                {isOrganizer && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="New Team Name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="bg-background border border-input rounded px-2 py-1 text-sm flex-1"
                        />
                        <button onClick={addTeam} className="px-3 py-1 bg-muted text-foreground rounded hover:bg-muted/80 text-sm whitespace-nowrap">+ Add</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 ml-2"
                        >
                            {saving ? 'Saving...' : 'Save Teams'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {/* Unassigned Section */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-muted-foreground mb-3 flex items-center justify-between">
                        Unassigned ({unassigned.length})
                    </h4>

                    {unassigned.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">All players assigned!</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {unassigned.map((p) => (
                                <div key={p.id} className="bg-card p-3 rounded shadow-sm border border-border flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {(p.user.name || p.user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-foreground truncate" title={p.user.email}>
                                            {p.user.name || p.user.email.split('@')[0]}
                                        </span>
                                    </div>

                                    {isOrganizer && (
                                        <div className="mt-1">
                                            <select
                                                className="w-full text-xs p-1 rounded bg-muted text-foreground border border-input"
                                                onChange={(e) => moveParticipant(p.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="" disabled>Assign to...</option>
                                                {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => {
                        const members = participants.filter(p => p.team_name === team);
                        // Generate a pseudo-random color based on team name length for visual distinction
                        const colorClass = team.length % 2 === 0
                            ? 'border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10'
                            : 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10';
                        const textClass = team.length % 2 === 0
                            ? 'text-indigo-800 dark:text-indigo-300'
                            : 'text-emerald-800 dark:text-emerald-300';
                        const borderClass = team.length % 2 === 0 ? 'border-indigo-400' : 'border-emerald-400';

                        return (
                            <div key={team} className={`p-4 rounded-lg border ${colorClass}`}>
                                <h4 className={`font-medium ${textClass} mb-3 flex justify-between items-center`}>
                                    {team} ({members.length})
                                </h4>
                                <ul className="space-y-2">
                                    {members.map((p) => (
                                        <li key={p.id} className={`bg-card p-2 rounded shadow-sm text-sm flex justify-between items-center border-l-4 ${borderClass} text-foreground`}>
                                            <span className="truncate max-w-[120px]" title={p.user.email}>
                                                {p.user.name || p.user.email.split('@')[0]}
                                            </span>
                                            {isOrganizer && (
                                                <button
                                                    onClick={() => moveParticipant(p.id, null)}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                    title="Remove from team"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                    {members.length === 0 && (
                                        <li className="text-xs text-muted-foreground italic py-2">No players yet</li>
                                    )}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
