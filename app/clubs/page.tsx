import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ClubList from '@/components/ClubList';

export default async function ClubsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Internal Clubs</h1>
                    <p className="mt-2 text-gray-600">
                        Join interest-based clubs within {user.company_domain ? user.company_domain : 'your company'} and connect with colleagues.
                    </p>
                </div>
                <ClubList userEmail={user.email} />
            </div>
        </div>
    );
}
