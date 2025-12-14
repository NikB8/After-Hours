'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Club = {
    id: string;
    name: string;
    description: string;
    category: string;
    _count: { members: number };
};

export default function ClubList({ userEmail }: { userEmail: string }) {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Sports' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const res = await fetch(`/api/v1/clubs?user_email=${encodeURIComponent(userEmail)}`);
            const data = await res.json();
            if (data.clubs) setClubs(data.clubs);
        } catch (error) {
            console.error('Error fetching clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/v1/clubs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newClub, user_email: userEmail }),
            });

            if (res.ok) {
                setNewClub({ name: '', description: '', category: 'Sports' });
                setShowCreate(false);
                fetchClubs();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create club');
            }
        } catch (error) {
            console.error('Error creating club:', error);
            setError('An error occurred while creating the club');
        }
    };

    if (loading) return <div>Loading clubs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Your Company Clubs</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    {showCreate ? 'Cancel' : 'Create New Club'}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-card p-6 rounded-lg shadow-md space-y-4 border border-border">
                    <h3 className="text-lg font-medium text-foreground">Create a Club</h3>
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Club Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={newClub.name}
                            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Description <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            value={newClub.description}
                            onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Category</label>
                        <select
                            value={newClub.category}
                            onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                        >
                            <option value="Sports">Sports</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Arts">Arts</option>
                            <option value="Book">Book Club</option>
                            <option value="Music">Music/Singing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Create Club
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                    <Link href={`/clubs/${club.id}`} key={club.id} className="block">
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold text-foreground">{club.name}</h3>
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                    {club.category}
                                </span>
                            </div>
                            <p className="mt-2 text-muted-foreground line-clamp-2">{club.description}</p>
                            <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                <span>👥 {club._count.members} Members</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {clubs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No clubs found. Be the first to start one!
                    </div>
                )}
            </div>
        </div>
    );
}
