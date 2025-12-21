'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

export default function RolesPage() {
    const { showToast } = useToast();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/roles');
            if (res.ok) setRoles(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleData.name.trim()) return;

        try {
            const res = await fetch('/api/v1/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoleData)
            });
            if (res.ok) {
                setNewRoleData({ name: '', description: '' });
                setIsCreating(false);
                fetchRoles();
                showToast('Role created successfully', 'success');
            } else {
                showToast('Failed to create role', 'error');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Role Definitions</h1>
                    <p className="text-muted-foreground">Define roles available for assignment in the system.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create Role
                </button>
            </div>

            {isCreating && (
                <div className="p-6 bg-card border border-border rounded-xl shadow-lg ring-1 ring-border text-left">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Define new Role</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                autoFocus
                                placeholder="Role Name (e.g. Moderator)"
                                className="border border-border bg-background text-foreground p-2 rounded-lg w-full"
                                value={newRoleData.name}
                                onChange={e => setNewRoleData({ ...newRoleData, name: e.target.value })}
                            />
                            <input
                                placeholder="Description (Optional)"
                                className="border border-border bg-background text-foreground p-2 rounded-lg w-full"
                                value={newRoleData.description}
                                onChange={e => setNewRoleData({ ...newRoleData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-start gap-4 hover:shadow-md transition">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">{role.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">ID: {role.id}</p>
                            {role.description && <p className="text-sm text-muted-foreground mt-2 italic">"{role.description}"</p>}
                            <div className="mt-3 flex gap-2">
                                <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">Global</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">No custom roles defined yet.</div>
            )}
        </div>
    );
}
