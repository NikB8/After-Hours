'use client';

import { useState } from 'react';
import { User, Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePersonal({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        // Here you would implement PUT /api/v1/users/me to update name
        // For now we just toggle edit mode off
        setIsEditing(false);
    };

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                </h3>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className={`flex-1 p-2 rounded-lg border ${isEditing ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}
                        />
                        {isEditing ? (
                            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Save</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted">Edit</button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border text-foreground">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Company</label>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border text-foreground">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{user.company_name || user.company_domain || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-3">Your Clubs</label>
                    {user.clubs && user.clubs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {user.clubs.map((club: any) => (
                                <Link
                                    key={club.id}
                                    href={`/clubs/${club.id}`}
                                    className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium text-foreground group-hover:text-primary">{club.name}</div>
                                        <div className="text-xs text-muted-foreground">{club.role}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {club.name[0]}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">You haven't joined any clubs yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
