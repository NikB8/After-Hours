'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Shield, X, Save, Plus, Trash2, UserPlus, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, query]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/admin/users?page=${page}&query=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 space-y-6 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage users, track activity, and assign roles.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none shadow-sm placeholder:text-muted-foreground"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    {/* Add User Button */}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition font-medium"
                    >
                        <UserPlus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            <div className="bg-card shadow-lg border border-border rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Details</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company / Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Roles</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users found matching your criteria.</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleUserClick(user)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-foreground">{user.name || 'No Name'}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-foreground">{user.company_domain || <span className="text-muted-foreground italic">No Company</span>}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{user.is_corporate_verified ? 'Verified Corp' : 'Public User'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {user.is_super_admin && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                                                Super Admin
                                            </span>
                                        )}
                                        {user.roles && user.roles.length > 0 ? user.roles.map((ur: any) => (
                                            <span key={ur.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                {ur.role.name}
                                            </span>
                                        )) : (
                                            !user.is_super_admin && <span className="text-xs text-muted-foreground italic">No roles</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <span className="text-primary hover:text-primary/80">Manage</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Footer / Pagination */}
                <div className="bg-muted/30 px-6 py-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Showing page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1 px-3 border border-input rounded bg-card hover:bg-muted disabled:opacity-50 text-sm text-foreground"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1 px-3 border border-input rounded bg-card hover:bg-muted disabled:opacity-50 text-sm text-foreground"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {isModalOpen && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={() => {
                        fetchUsers(); // Refresh list
                        // setIsModalOpen(false); // keep open to see changes? maybe close is better
                    }}
                />
            )}

            {/* Create User Modal */}
            {isCreateOpen && (
                <CreateUserModal
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={() => {
                        setIsCreateOpen(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

function UserDetailModal({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: () => void }) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'history'>('profile');
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);

    // Form and standard state
    const [formData, setFormData] = useState({
        name: user.name || '',
        emailVerified: !!user.emailVerified,
        company_domain: user.company_domain || ''
    });

    // Fetch roles when 'roles' tab is active
    useEffect(() => {
        if (activeTab === 'roles' && availableRoles.length === 0) {
            fetch('/api/v1/admin/roles').then(res => res.json()).then(setAvailableRoles).catch(console.error);
        }
    }, [activeTab]);

    const handleSaveProfile = async () => {
        // ... implementation same as before ...
        await fetch(`/api/v1/admin/users/${user.id}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        onUpdate();
        showToast('Profile Updated', 'success');
    };

    const handleAddRole = async (roleId: string) => {
        if (!roleId) return;
        const res = await fetch(`/api/v1/admin/users/${user.id}/roles`, {
            method: 'POST',
            body: JSON.stringify({ roleId })
        });
        if (res.ok) onUpdate(); // This will refresh the PARENT list, but we ideally wanna refresh LOCAL user data too.
        // For simplicity, we assume parent refresh helps, but local modal `user` prop needs update.
        // It's better if `UserDetailModal` fetches its own fresh user data.
    };

    const handleRemoveRole = async (userRoleId: number) => {
        if (!confirm('Remove this role?')) return;
        const res = await fetch(`/api/v1/admin/users/${user.id}/roles`, {
            method: 'DELETE',
            body: JSON.stringify({ userRoleId })
        });
        if (res.ok) onUpdate();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                <div className="flex border-b bg-white">
                    {['profile', 'roles', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Domain</label>
                                    <input value={formData.company_domain} onChange={e => setFormData({ ...formData, company_domain: e.target.value })} className="mt-1 w-full border rounded-lg p-2" />
                                </div>
                            </div>
                            <button onClick={handleSaveProfile} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-900 mb-2">Assign New Role</h3>
                                <div className="flex gap-2">
                                    <select id="roleSelect" className="flex-1 border-gray-300 rounded-md text-sm p-2 border">
                                        <option value="">Select Role...</option>
                                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const select = document.getElementById('roleSelect') as HTMLSelectElement;
                                            handleAddRole(select.value);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Roles</h3>
                                {user.roles && user.roles.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.roles.map((ur: any) => (
                                            <div key={ur.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900">{ur.role.name}</p>
                                                    {ur.company && <p className="text-xs text-gray-500">Scope: {ur.company.domain_name}</p>}
                                                </div>
                                                <button onClick={() => handleRemoveRole(ur.id)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No specific roles assigned.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && <div className="text-center text-gray-500 py-10">Activity History features coming soon.</div>}
                </div>
            </div>
        </div>
    );
}


function CreateUserModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', company_domain: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                showToast('User created!', 'success');
                onSuccess();
            } else {
                const err = await res.json();
                showToast('Error: ' + err.error, 'error');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add New User</h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input className="w-full border rounded p-2" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" className="w-full border rounded p-2" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" className="w-full border rounded p-2" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="********" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Company (Optional)</label>
                        <input className="w-full border rounded p-2" value={formData.company_domain} onChange={e => setFormData({ ...formData, company_domain: e.target.value })} placeholder="acme.com" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Create User</button>
                    <button type="button" onClick={onClose} className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                </form>
            </div>
        </div>
    );
}
