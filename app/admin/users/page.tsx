'use client';

import { useState, useEffect } from 'react';

const CURRENT_USER_EMAIL = 'nikhil@example.com';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/v1/admin/users?user_email=${CURRENT_USER_EMAIL}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'revoke' : 'grant'} admin access?`)) return;

        try {
            const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: CURRENT_USER_EMAIL,
                    is_super_admin: !currentStatus,
                }),
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_super_admin: !currentStatus } : u));
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    if (loading) return <div className="animate-pulse">Loading users...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.company_domain || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.skill_level}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.is_super_admin ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">User</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => toggleAdmin(user.id, user.is_super_admin)}
                                        className={`text-xs font-medium hover:underline ${user.is_super_admin ? 'text-red-600' : 'text-blue-600'
                                            }`}
                                    >
                                        {user.is_super_admin ? 'Revoke Admin' : 'Promote to Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
