import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user as any;

    if (!user || !user.is_super_admin) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Admin Sub-Navigation */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-sm text-gray-500">System Administration & Monitoring</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <NavLink href="/admin">Dashboard</NavLink>
                        <NavLink href="/admin/users">Users</NavLink>
                        <NavLink href="/admin/roles">Roles</NavLink>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-8 pb-12">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    // Note: Active state logic requires 'use client' or inspection of path in Server Component? 
    // For simplicity in Server Component, we just use standard links. 
    // If strict active state style is needed, we'd make a Client Component wrapper.
    // For now, simple styling.
    return (
        <Link
            href={href}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all rounded-md"
        >
            {children}
        </Link>
    );
}
