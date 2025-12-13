
import ParticipantCard from '@/components/ParticipantCard';

export default async function InvitePage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params;
    const { ref } = await searchParams;
    const referrerId = typeof ref === 'string' ? ref : undefined;

    return (
        <div className="bg-gray-100 min-h-screen">
            <ParticipantCard eventId={id} referrerId={referrerId} />
        </div>
    );
}
