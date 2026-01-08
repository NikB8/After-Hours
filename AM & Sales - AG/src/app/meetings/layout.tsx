
import InternalNavbar from '@/components/InternalNavbar';

export default function MeetingsLayout({
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
