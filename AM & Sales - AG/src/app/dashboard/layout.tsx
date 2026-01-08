
import InternalNavbar from '@/components/InternalNavbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <InternalNavbar />
            {children}
        </div>
    );
}
