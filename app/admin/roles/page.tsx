'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
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
            } else {
                alert('Failed to create role');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Role Definitions</h1>
                    <p className="text-gray-500">Define roles available for assignment in the system.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create Role
                </button>
            </div>

            {isCreating && (
                <div className="p-6 bg-white border border-blue-100 rounded-xl shadow-lg ring-1 ring-blue-500 text-left">
                    <h3 className="text-lg font-semibold mb-4">Define new Role</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                autoFocus
                                placeholder="Role Name (e.g. Moderator)"
                                className="border p-2 rounded-lg w-full"
                                value={newRoleData.name}
                                onChange={e => setNewRoleData({ ...newRoleData, name: e.target.value })}
                            />
                            <input
                                placeholder="Description (Optional)"
                                className="border p-2 rounded-lg w-full"
                                value={newRoleData.description}
                                onChange={e => setNewRoleData({ ...newRoleData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4 hover:shadow-md transition">
                        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{role.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">ID: {role.id}</p>
                            {role.description && <p className="text-sm text-gray-600 mt-2 italic">"{role.description}"</p>}
                            <div className="mt-3 flex gap-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">Global</span>
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
