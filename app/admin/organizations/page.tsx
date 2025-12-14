
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users } from 'lucide-react';

export default function AdminOrgsPage() {
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/admin/organizations')
            .then(res => res.json())
            .then(data => {
                setOrgs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Organization Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs.map((org, idx) => (
                    <Link
                        key={idx}
                        href={`/admin/users?company_domain=${org.domain}`}
                        className="block bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{org.domain || 'Unknown Domain'}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Users className="w-3 h-3" /> {org.user_count} Users
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
