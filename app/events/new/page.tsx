import EventForm from '@/components/EventForm';

export default function NewEventPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Create New Event</h1>
                <EventForm userEmail="nikhil@example.com" />
            </div>
        </div>
    );
}
