import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

// Mock current user - in real app use session
const CURRENT_USER_EMAIL = 'nikhil@example.com';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await prisma.user.findUnique({ where: { email: CURRENT_USER_EMAIL } });

    if (!user || !user.is_super_admin) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-6">
                <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
                <nav className="space-y-4">
                    <a href="/admin" className="block py-2 px-4 rounded hover:bg-gray-800">Dashboard</a>
                    <a href="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-800">Users</a>
                    <a href="/" className="block py-2 px-4 rounded hover:bg-gray-800 text-gray-400 mt-8">Exit to App</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
