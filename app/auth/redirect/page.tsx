import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/');
    }

    // Role-based routing logic
    const user = session.user as any;
    const roles = user.roles || [];
    const isSuperAdmin = user?.is_super_admin;
    const hasAdminRole = roles.some((r: any) => r.name === 'System_Admin' || r.name === 'Corporate_Admin');

    if (isSuperAdmin || hasAdminRole) {
        redirect('/admin');
    } else {
        // Player / Organizer / Default
        redirect('/');
    }
}
