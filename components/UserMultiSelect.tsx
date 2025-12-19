
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';

type User = {
    id: string;
    name: string | null;
    email: string | null;
};

interface UserMultiSelectProps {
    onSelectionChange: (selectedIds: string[]) => void;
    initialSelectedIds?: string[];
}

export default function UserMultiSelect({ onSelectionChange, initialSelectedIds = [] }: UserMultiSelectProps) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchUsers(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const fetchUsers = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/users/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);
        let newSelection;
        if (isSelected) {
            newSelection = selectedUsers.filter(u => u.id !== user.id);
        } else {
            newSelection = [...selectedUsers, user];
        }
        setSelectedUsers(newSelection);
        onSelectionChange(newSelection.map(u => u.id));
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1">Invite Colleagues</label>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(user => (
                    <span key={user.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {user.name || user.email}
                        <button type="button" onClick={() => toggleUser(user)} className="ml-1 hover:text-primary/70">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>

            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                // Don't close immediately on blur to allow clicking items
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-popover shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-border">
                    {loading && <div className="px-4 py-2 text-muted-foreground">Loading...</div>}
                    {!loading && users.length === 0 && (
                        <div className="px-4 py-2 text-muted-foreground">No colleagues found.</div>
                    )}
                    {!loading && users.map(user => {
                        const isSelected = selectedUsers.some(u => u.id === user.id);
                        return (
                            <div
                                key={user.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-muted ${isSelected ? 'bg-primary/5' : ''}`}
                                onClick={() => toggleUser(user)}
                            >
                                <div className="flex items-center">
                                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                                        {user.name} <span className="text-muted-foreground text-xs">({user.email})</span>
                                    </span>
                                </div>
                                {isSelected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    {/* Close Area */}
                    <div
                        className="border-t border-border px-4 py-2 text-xs text-center text-primary cursor-pointer hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                    >
                        Close
                    </div>
                </div>
            )}
        </div>
    );
}
